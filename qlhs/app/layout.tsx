import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../src/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quản lý hồ sơ',
  description: 'Hệ thống quản lý hồ sơ và tài liệu',
  keywords: ['quản lý hồ sơ', 'tài liệu', 'hệ thống'],
  authors: [{ name: 'QLHS Team' }],
  creator: 'QLHS Team',
  publisher: 'QLHS Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // metadataBase: new URL('http://localhost:3000'), //
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Quản lý hồ sơ',
    description: 'Hệ thống quản lý hồ sơ và tài liệu',
    // url: 'http://localhost:3000',
    siteName: 'Quản lý hồ sơ',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quản lý hồ sơ',
    description: 'Hệ thống quản lý hồ sơ và tài liệu',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      {
        url: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/images/logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
  
          <Toaster position="top-right" />
          <AuthProvider>
            {children}
          </AuthProvider>
  
      </body>
    </html>
  );
}