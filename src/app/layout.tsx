import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BQMS | Biofix Quality Management System",
  description: "Water Quality Transparency, Verification, Compliance and Public Trust Platform",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (const registration of registrations) {
                    registration.unregister().then((success) => {
                      if (success) console.log('Unregistered stale service worker');
                    });
                  }
                });
              }
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
