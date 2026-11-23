import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// Tipografía del diseño (DM Sans). Next la descarga al compilar y la sirve desde nuestro propio sitio.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Chumbo",
  description: "Dejá propinas y regalos con un QR. Cada propina suma puntos.",
  applicationName: "Chumbo",
  appleWebApp: { capable: true, title: "Chumbo", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#070908",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={dmSans.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
