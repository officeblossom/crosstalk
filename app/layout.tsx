import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Cross Talk | 話すことから、何かがはじまる。", description: "北九州の各地で開催する月に一度のトークイベント Cross Talk の参加申し込み。", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body>{children}</body></html>; }
