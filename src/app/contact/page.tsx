'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ContactPage() {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="container-custom space-y-12 max-w-5xl">
        <div className="border-b border-neutral-200 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            Get In Touch
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black mt-1">
            Contact & Support
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Have questions about sizes, bulk customization, or order tracking? Reach out to our team in AK Khan, Chattogram.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Contact Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <MapPin className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Studio & Workshop Address
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">{settings.site_address}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    AK Khan Gate, Pahartali, Chattogram 4207, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Phone className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Phone & WhatsApp Helpline
                  </h3>
                  <p className="text-xs font-mono text-neutral-900 mt-1">{settings.site_phone}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Available Saturday to Thursday, 10:00 AM – 8:00 PM BST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200">
                <Mail className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Email Inquiries
                  </h3>
                  <p className="text-xs text-neutral-900 mt-1">{settings.site_email}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Responses typically within 4 business hours
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black text-white space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Bulk Orders & Brand Merchandise
              </h4>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Planning university club batches, corporate uniforms, or musical band merchandise?
                We provide custom digital mockups and tiered volume discounts starting at 30 pieces.
              </p>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="bg-neutral-50 border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-4">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-6 bg-white border border-neutral-300 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
                <h3 className="text-sm font-bold uppercase text-black">Message Sent!</h3>
                <p className="text-xs text-neutral-500">
                  Thank you for reaching out. A representative from our Chattogram office will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-outline text-xs mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-neutral-300 focus:border-black outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-neutral-300 focus:border-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                    Message / Custom Request Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what style, size, or custom design you need..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-neutral-300 focus:border-black outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
