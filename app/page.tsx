"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = { id: number; slug: string; edition: number; eventDate: string; venue: string; locationName: string };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(new Date(`${value}T00:00:00`));
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => { fetch("/api/events").then((r) => r.json()).then((d) => setEvents(d.events ?? [])).catch(() => setEvents([])); }, []);
  return <main className="landing">
    <header className="topbar"><Link href="/" className="brand">CROSS TALK<span>.</span></Link><Link href="/admin" className="quiet-link">運営者の方へ</Link></header>
    <section className="hero">
      <div className="eyebrow"><span /> TALK EVENT / KITAKYUSHU</div>
      <h1>話すことで、<br/><em>街と人が近くなる。</em></h1>
      <p>Cross Talkは、肩書きを越えて気軽に話す月に一度のトークイベントです。初めての方も、どうぞ気楽にご参加ください。</p>
      <div className="scroll-note">開催予定を見る <span>↓</span></div>
    </section>
    <section className="schedule" id="schedule">
      <div className="section-heading"><p>NEXT EVENTS</p><h2>次回のCross Talk</h2></div>
      <div className="event-grid">
        {events.length ? events.map((event, i) => <Link className="event-card" href={`/e/${event.slug}`} key={event.id}>
          <div className="event-index">0{i + 1}</div><div className="event-place">{event.locationName}</div>
          <h3>Cross Talk<br/>{event.locationName}</h3>
          <dl><div><dt>DATE</dt><dd>{dateLabel(event.eventDate)}</dd></div><div><dt>VENUE</dt><dd>{event.venue}</dd></div></dl>
          <div className="join">参加を申し込む <span>→</span></div>
        </Link>) : <div className="empty-card"><strong>次回イベントは準備中です</strong><p>開催が決まり次第、こちらでお知らせします。</p></div>}
      </div>
    </section>
    <footer><div className="brand footer-brand">CROSS TALK<span>.</span></div><p>話すことから、何かがはじまる。</p><small>© 2026 CROSS TALK</small></footer>
  </main>;
}
