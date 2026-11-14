import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroShift NASA — Adapting Farms with NASA Data",
  description:
    "Herramienta simple de apoyo agrícola para evaluar riesgos climáticos y comparar rotaciones de cultivos con datos de NASA y ESA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
