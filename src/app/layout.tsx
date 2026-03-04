import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Analytics - AI Powered Dashboard',
  description: 'Full-stack analytics & prediction dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>

          <Sidebar />
          <div className="flex flex-col sm:gap-4 sm:py-0 w-full lg:flex-1 relative z-0">
            <Header />
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-auto h-[calc(100vh-60px)]">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

