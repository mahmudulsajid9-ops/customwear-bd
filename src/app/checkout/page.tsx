'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Lock,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart, createOrder, settings, user, validateCoupon } = useStore();

  // Shipping information
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [addressLine, setAddressLine] = useState('');
  const [zone, setZone] = useState<'inside_chattogram' | 'outside_chattogram'>(
    'inside_chattogram'
  );
  const [city, setCity] = useState('Chattogram');
  const [district, setDistrict] = useState('Chattogram');
  const [instructions, setInstructions] = useState('');

  // Payment information
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>(
    settings.enable_cod ? 'cod' : settings.enable_bkash ? 'bkash' : 'nagad'
  );
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');

  // Promo code / Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate shipping fee
  const freeThreshold = settings.free_shipping_threshold || 1000;
  const isFreeShipping = cartSubtotal >= freeThreshold;
  const shippingFee = isFreeShipping
    ? 0
    : zone === 'inside_chattogram'
    ? settings.shipping_inside_ctg || 60
    : settings.shipping_outside_ctg || 120;

  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">
          Your cart is empty
        </h1>
        <p className="text-xs text-neutral-500 mb-6">
          Add some stylish custom items before proceeding to checkout.
        </p>
        <Link href="/shop" className="btn-primary text-xs">
          Explore Collection
        </Link>
      </div>
    );
  }

  const handleZoneChange = (newZone: 'inside_chattogram' | 'outside_chattogram') => {
    setZone(newZone);
    if (newZone === 'inside_chattogram') {
      setCity('Chattogram');
      setDistrict('Chattogram');
    } else {
      setCity('Dhaka');
      setDistrict('Dhaka');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await validateCoupon(couponInput.trim(), cartSubtotal);
    setCouponLoading(false);
    if (res.valid && res.discount_amount !== undefined) {
      setAppliedCoupon({
        code: couponInput.trim().toUpperCase(),
        discount_amount: res.discount_amount,
        message: res.message || 'Coupon applied successfully!',
      });
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    // Form validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setError('Please provide a valid 11-digit Bangladeshi mobile number.');
      return;
    }

    if (!addressLine.trim()) {
      setError('Please enter your complete delivery street address.');
      return;
    }

    // Payment validation if digital
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      if (!transactionId.trim()) {
        setError(`Please enter your ${paymentMethod.toUpperCase()} Transaction ID (TrxID).`);
        return;
      }
      if (!senderPhone.trim()) {
        setError(
          `Please enter the mobile number used to send the ${paymentMethod.toUpperCase()} payment.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Build order items
      const orderItems = cart.map((item) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        product_id: item.product_id,
        variation_id: item.variation_id,
        product_name: item.product_name,
        selected_size: item.selected_size,
        selected_color: item.selected_color,
        sku: item.sku,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
        image_url: item.image_url,
        custom_instruction: item.custom_instruction,
      }));

      const newOrder = await createOrder({
        user_id: user?.id,
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: cleanPhone,
        address_line: addressLine.trim(),
        city,
        district,
        zone,
        delivery_instructions: instructions.trim() || undefined,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
        subtotal: cartSubtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon?.code || undefined,
        total,
        transaction_id: transactionId.trim() || undefined,
        sender_phone: senderPhone.trim() || undefined,
        items: orderItems,
      });

      // Clear shopping bag
      clearCart();

      // Navigate to confirmation page
      router.push(`/order-confirmation/${newOrder.order_number}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred while creating your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-neutral-50">
      <div className="container-custom">
        <div className="mb-8 pb-4 border-b border-neutral-200">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Secure Checkout
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Complete your order with Cash on Delivery or bKash / Nagad / Rocket verification.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Delivery & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer & Delivery Address Card */}
            <div className="bg-white p-6 border border-neutral-200 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                1. Delivery Destination & Contact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Phone Number (11-digit mobile) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Email Address <span className="text-neutral-400 font-normal lowercase">(optional, for order tracking updates)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
                />
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Delivery Region <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleZoneChange('inside_chattogram')}
                    className={`p-3 border text-left transition-all ${
                      zone === 'inside_chattogram'
                        ? 'border-black bg-neutral-100 font-bold'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    <div className="text-xs text-neutral-900">Inside Chattogram</div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      {isFreeShipping ? 'FREE' : `৳${settings.shipping_inside_ctg || 60} (24-48h)`}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleZoneChange('outside_chattogram')}
                    className={`p-3 border text-left transition-all ${
                      zone === 'outside_chattogram'
                        ? 'border-black bg-neutral-100 font-bold'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    <div className="text-xs text-neutral-900">Outside Chattogram / All BD</div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      {isFreeShipping ? 'FREE' : `৳${settings.shipping_outside_ctg || 120} (48-72h)`}
                    </div>
                  </button>
                </div>
              </div>

              {/* Address details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Chattogram, Dhaka, Sylhet"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    City / Upazila / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pahartali, AK Khan, Dhanmondi"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Full Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House No, Road No, Area, Near landmark (e.g. Near AK Khan Gate, Chattogram)"
                  className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Order Notes <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Call before delivery, leave with guard"
                  className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 focus:border-black outline-none"
                />
              </div>
            </div>

            {/* 2. Bangladesh Payment Methods Card */}
            <div className="bg-white p-6 border border-neutral-200 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                2. Bangladesh Payment Options
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                {settings.enable_cod !== false && (
                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-black bg-neutral-50 ring-1 ring-black'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-neutral-700" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase px-1.5 py-0.5 bg-neutral-100">
                          Pay upon delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {settings.cod_instructions ||
                          'Pay with cash directly to the courier agent when your parcel is delivered.'}
                      </p>
                    </div>
                  </label>
                )}

                {/* Manual bKash */}
                {settings.enable_bkash !== false && (
                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-black bg-neutral-50 ring-1 ring-black'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-pink-600" />
                          Manual bKash Payment
                        </span>
                        <span className="text-[10px] font-semibold text-pink-700 uppercase px-1.5 py-0.5 bg-pink-50">
                          bKash Personal / Send Money
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        Send total <span className="font-bold text-black">{settings.currency_symbol}{total}</span> to our bKash number:{' '}
                        <span className="font-bold font-mono text-black">{settings.bkash_number}</span>
                      </p>
                    </div>
                  </label>
                )}

                {/* Manual Nagad */}
                {settings.enable_nagad !== false && (
                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-black bg-neutral-50 ring-1 ring-black'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-orange-600" />
                          Manual Nagad Payment
                        </span>
                        <span className="text-[10px] font-semibold text-orange-700 uppercase px-1.5 py-0.5 bg-orange-50">
                          Nagad Personal / Send Money
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        Send total <span className="font-bold text-black">{settings.currency_symbol}{total}</span> to our Nagad number:{' '}
                        <span className="font-bold font-mono text-black">{settings.nagad_number}</span>
                      </p>
                    </div>
                  </label>
                )}

                {/* Manual Rocket */}
                {settings.enable_rocket !== false && (
                  <label
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-all ${
                      paymentMethod === 'rocket'
                        ? 'border-black bg-neutral-50 ring-1 ring-black'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="rocket"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="mt-1 accent-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-purple-600" />
                          Manual Rocket Payment
                        </span>
                        <span className="text-[10px] font-semibold text-purple-700 uppercase px-1.5 py-0.5 bg-purple-50">
                          DBBL Rocket
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1">
                        Send total <span className="font-bold text-black">{settings.currency_symbol}{total}</span> to our Rocket number:{' '}
                        <span className="font-bold font-mono text-black">{settings.rocket_number}</span>
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Instructions and Transaction ID Inputs for bKash, Nagad, or Rocket */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                <div className="p-4 bg-neutral-100 border border-neutral-300 space-y-3">
                  <div className="text-xs text-neutral-800 space-y-1">
                    <span className="font-bold uppercase tracking-wider block text-black">
                      Send Money Instructions ({paymentMethod.toUpperCase()}):
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      {paymentMethod === 'bkash'
                        ? settings.bkash_instructions
                        : paymentMethod === 'nagad'
                        ? settings.nagad_instructions
                        : settings.rocket_instructions}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                        Transaction ID (TrxID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. BKH9827361 / TRX-12345"
                        className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 focus:border-black outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                        Sender Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 focus:border-black outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Anti-fraud / Security Notice */}
                  <div className="p-2.5 bg-neutral-200 border border-neutral-300 text-[10px] text-neutral-700 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Manual mobile payments remain{' '}
                      <em>Pending Verification</em> until an administrator verifies the transaction.
                      CustomWear BD will NEVER ask for your MFS PIN or OTP.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 border border-neutral-200 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100">
                Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-14 h-18 object-cover border border-neutral-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {item.product_name}
                        </p>
                        <div className="flex gap-2 text-[10px] text-neutral-500 mt-0.5">
                          {item.selected_size && <span>Size: {item.selected_size}</span>}
                          {item.selected_color && <span>Color: {item.selected_color}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                        {item.custom_instruction && (
                          <p className="text-[10px] text-neutral-600 italic line-clamp-1">
                            Custom: &quot;{item.custom_instruction}&quot;
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-bold font-mono text-black">
                        {settings.currency_symbol}
                        {item.unit_price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo / Coupon Code Input */}
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                    Promo / Coupon Code
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Try: CUSTOM10 or FREESHIP
                  </span>
                </div>
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-800 uppercase tracking-wide">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-700 ml-2">
                        (-{settings.currency_symbol}{appliedCoupon.discount_amount})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-neutral-500 hover:text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="ENTER PROMO CODE"
                      className="flex-1 text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 focus:border-black outline-none font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="btn-primary text-xs py-2 px-3 whitespace-nowrap disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    {settings.currency_symbol}
                    {cartSubtotal}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>
                    Delivery Charge (
                    {zone === 'inside_chattogram' ? 'Chattogram' : 'All Bangladesh'}):
                  </span>
                  <span className="font-mono">
                    {isFreeShipping ? (
                      <span className="text-green-700 font-semibold uppercase">Free</span>
                    ) : (
                      `${settings.currency_symbol}${shippingFee}`
                    )}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span className="font-mono">
                      -{settings.currency_symbol}
                      {discountAmount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base text-black pt-2 border-t border-neutral-200">
                  <span>Total Amount:</span>
                  <span className="font-mono">
                    {settings.currency_symbol}
                    {total}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3.5 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Processing Order...' : 'Place Order Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-[11px] text-neutral-400 text-center space-y-1">
                <p className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>100% Secure Checkout • Cash on Delivery & MFS Verification</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
