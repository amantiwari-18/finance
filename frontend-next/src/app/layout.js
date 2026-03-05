import './globals.css';

export const metadata = {
  title: 'PPSJ Financial Solutions',
  description: 'Premium wealth management and financial tracking suite.',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinanceTracker',
  },
};

import { Toaster } from 'react-hot-toast';
import PWA from '@/components/PWA';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <PWA />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0E0E11',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
