import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cross talk〜街と人を繋ぐ、令和の井戸端会議〜",
  description: "各地で開催する月に一度のトークイベント Cross Talk の参加申し込み。",
  icons: { icon: "/logo.png" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ja"><body>{children}</body></html>; }
