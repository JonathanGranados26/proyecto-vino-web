import type { Metadata } from 'next';
import { Providers } from '@/components/ApolloProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GWS Wine Platform',
  description: 'Premium wine and spirits e-commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}