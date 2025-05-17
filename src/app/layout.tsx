import type { Metadata } from 'next';
import { Lora } from 'next/font/google'; // Changed from Geist to Lora
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const lora = Lora({ // Changed font setup
  subsets: ['latin'],
  variable: '--font-lora-family', // Custom variable name for Lora
});

export const metadata: Metadata = {
  title: 'DaybookAI', // Updated app title
  description: 'Log your daily activities with AI assistance.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">{/* Added dark class for default dark theme */}
      <body className={`${lora.variable} antialiased font-lora`}> {/* Applied Lora font variable and class */}
        {children}
        <Toaster /> {/* Added Toaster for notifications */}
      </body>
    </html>
  );
}
