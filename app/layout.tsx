import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Photography Portfolio',
  description: 'Professional photography portfolio and print shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-primary">
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#262626',
              color: '#fff',
              border: '1px solid #404040',
            },
            success: {
              iconTheme: {
                primary: '#C9A962',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
