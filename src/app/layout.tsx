import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import StorefrontChrome from '@/components/layouts/StorefrontChrome';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'CustomWear BD — Your Design, Your Style | Premium Bangladeshi Apparel',
  description:
    'CustomWear BD is your premier destination for custom T-shirts, oversized streetwear, hoodies, and polo shirts. Crafted in AK Khan, Chattogram, delivering across Bangladesh.',
  keywords: [
    'custom t-shirt bd',
    'chattogram clothing brand',
    'oversized t-shirt bangladesh',
    'hoodies bd',
    'customwear bd',
    'custom print apparel bangladesh',
  ],
  authors: [{ name: 'CustomWear BD' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}>
        <StoreProvider>
          <StorefrontChrome>{children}</StorefrontChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
