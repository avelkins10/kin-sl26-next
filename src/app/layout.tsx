import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "kinsight — Street League 2026",
  description: "KIN Home Solar Street League 2026 competitions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
