import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sin nombre aun",
  description: "CallateBauti",
  icons: {
    icon: "https://img.freepik.com/vector-gratis/dibujado-mano-realista-vete-mierda-simbolo_23-2148684365.jpg?semt=ais_hybrid&w=740&q=80"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
