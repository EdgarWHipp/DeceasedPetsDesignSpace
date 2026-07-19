import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A Design Space for Technology-Mediated Representations of Deceased Companion Animals",
  description:
    "An interactive explorer for the design space of technology-mediated representations of deceased companion animals. Master's thesis, Karlsruhe Institute of Technology (KIT).",
  openGraph: {
    type: "website",
    siteName: "Deceased Pets Design Space",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
