import type { Metadata } from "next";
import { Noto_Sans_JP, Oswald, Zen_Old_Mincho } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_JP({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const display = Oswald({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mincho = Zen_Old_Mincho({ variable: "--font-mincho", subsets: ["latin"], weight: ["700", "900"] });

export const metadata: Metadata = { title: "Cross Talk | 話すことから、何かがはじまる。", description: "北九州の各地で開催する月に一度のトークイベント Cross Talk の参加申し込み。", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body className={`${sans.variable} ${display.variable} ${mincho.variable}`}>{children}</body></html>; }
