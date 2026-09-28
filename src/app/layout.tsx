import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Web Vitals Lab',
  description: 'Демонстрация сбора LCP, INP и CLS со structured logging и correlation id.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
