"use client";

import { CSSProperties, useEffect, useState } from "react";

type Event = { id: number; slug: string; edition: number; eventDate: string; venue: string; address: string; participationFee: string; oneDrinkOrder: boolean; locationName: string; keyColor: string };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(new Date(`${value}T00:00:00`));
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => { fetch("/api/events").then((r) => r.json()).then((d) => setEvents(d.events ?? [])).catch(() => setEvents([])); }, []);
  return <main className="landing">
    <header className="topbar"><a href="/" className="home-logo" aria-label="トップへ戻る"><img src="/logoB.png" alt="Cross Talk"/></a><a href="/admin" className="quiet-link">運営者の方へ</a></header>
    <section className="hero">
      <div className="eyebrow"><span /> TALK EVENT</div>
      <h1 className="hero-copy">街と人を繋ぐ、<br/><em>令和の井戸端会議。</em></h1>
      <p>Cross Talkは、肩書きを越えて気軽に話す月に一度のトークイベントです。初めての方も、どうぞ気楽にご参加ください。</p>
      <div className="scroll-note">開催予定を見る <span>↓</span></div>
    </section>
    <section className="schedule" id="schedule">
      <div className="section-heading"><p>NEXT EVENTS</p><h2>次回のCross Talk</h2></div>
      <div className="event-grid">
        {events.length ? events.map((event, i) => <article className="event-card" key={event.id} style={{"--card-key":event.keyColor} as CSSProperties}>
          <div className="event-index">0{i + 1}</div><div className="event-place">{event.locationName}</div>
          <h3>Cross Talk<br/>{event.locationName}</h3>
          <dl><div><dt>DATE</dt><dd>{dateLabel(event.eventDate)}</dd></div><div><dt>VENUE</dt><dd>{event.venue}<small className="card-address">{event.address}</small></dd></div></dl>
          <a className="join" href={`/e/${event.slug}`}>参加を申し込む <span>→</span></a>
        </article>) : <div className="empty-card"><strong>次回イベントは準備中です</strong><p>開催が決まり次第、こちらでお知らせします。</p></div>}
      </div>
    </section>
    <section className="social-section" aria-labelledby="social-heading">
      <div className="section-heading social-heading"><p>FOLLOW CROSS TALK</p><h2 id="social-heading">日々のCross Talkを、<br/>もっと近くに。</h2></div>
      <div className="social-grid">
        <a className="social-card social-instagram" href="https://www.instagram.com/cross_talk00/" target="_blank" rel="noopener noreferrer" aria-label="Cross TalkのInstagramを見る（新しいタブで開きます）">
          <span className="social-number">01</span>
          <div><span className="social-platform">FOLLOW US</span><h3>Instagram</h3><p>開催のお知らせや、当日の空気を写真でお届けします。</p></div>
          <span className="social-link">Instagramを見る <b>↗</b></span>
        </a>
        <a className="social-card social-youtube" href="https://www.youtube.com/@CrossTalk-fuk" target="_blank" rel="noopener noreferrer" aria-label="Cross TalkのYouTubeを見る（新しいタブで開きます）">
          <span className="social-number">02</span>
          <div><span className="social-platform">WATCH US</span><h3>YouTube</h3><p>会場で交わされたトークや、Cross Talkの記録を映像で。</p></div>
          <span className="social-link">YouTubeを見る <b>↗</b></span>
        </a>
      </div>
    </section>
    <footer><div className="brand footer-brand">CROSS TALK<span>.</span></div><p>話すことから、何かがはじまる。</p><small>© 2026 CROSS TALK</small></footer>
  </main>;
}
