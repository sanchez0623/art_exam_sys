import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Art History Learning System',
  description: 'Personal art history learning and reference system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
