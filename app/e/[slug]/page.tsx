"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type EventData = { id: number; slug: string; edition: number; eventDate: string; venue: string; address: string; participationFee: string; oneDrinkOrder: boolean; locationName: string; keyColor: string; isOpen: boolean };

function longDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${value}T00:00:00`));
}

export default function EventPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { fetch(`/api/events/${slug}`).then((r) => r.json()).then((d) => setEvent(d.event ?? null)).finally(() => setLoading(false)); }, [slug]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const form = new FormData(e.currentTarget);
    const response = await fetch("/api/registrations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
      eventId: event?.id, name: form.get("name"), status: form.get("status"), affiliation: form.get("affiliation"),
      isFirstTime: form.get("firstTime") === "yes", topic: form.get("topic"),
    }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? "送信できませんでした");
    setSent(true); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <main className="form-shell"><div className="loading">読み込み中…</div></main>;
  if (!event) return <main className="form-shell"><div className="not-found"><h1>イベントが見つかりません</h1><a href="/">開催一覧へ戻る</a></div></main>;
  if (sent) return <main className="form-shell"><section className="thanks"><div className="thanks-mark">✓</div><p>THANK YOU</p><h1>お申し込みを<br/>受け付けました。</h1><p className="thanks-copy">当日、会場でお会いできることを楽しみにしています。</p><a href="/">開催一覧へ戻る →</a></section></main>;

  const isLight = event.keyColor.toLowerCase() === "#f1e6d4";
  return <main className={`form-shell ${isLight ? "light-key" : ""}`} style={{ "--event-key": event.keyColor } as CSSProperties}>
    <header className="topbar form-top"><a href="/" className="home-logo inverse" aria-label="トップへ戻る"><img src="/logo.png" alt="Cross Talk"/></a><span>ENTRY FORM</span></header>
    <section className="form-hero">
      <div className="edition">第{event.edition}回</div><p>CROSS TALK / {event.locationName.toUpperCase()}</p>
      <h1>Cross Talk<br/><em>{event.locationName}</em></h1>
      <div className="event-meta"><div><small>DATE</small><strong>{longDate(event.eventDate)}</strong></div><div><small>VENUE</small><strong>{event.venue}</strong><span>{event.address}</span></div>{event.participationFee && <div><small>FEE</small><strong>{event.participationFee}</strong>{event.oneDrinkOrder && <span>ワンドリンクオーダー</span>}</div>}</div>
    </section>
    <section className="entry-section">
      <div className="entry-intro"><p>ENTRY</p><h2>参加申し込み</h2><span>必要事項をご入力ください。<br/>所要時間は約1分です。</span></div>
      <form onSubmit={submit} className="entry-form">
        <label><span>お名前 <b>必須</b></span><input name="name" required placeholder="例：山田 太郎" autoComplete="name" /></label>
        <fieldset><legend>ステータス <b>必須</b></legend><div className="choice-row">
          {[['student','学生'],['worker','社会人'],['other','その他']].map(([v,l]) => <label className="radio" key={v}><input type="radio" name="status" value={v} required/><span>{l}</span></label>)}
        </div></fieldset>
        <label><span>所属 <b>必須</b></span><input name="affiliation" required placeholder="学校名・会社名など" /></label>
        <fieldset><legend>Cross Talkへの参加 <b>必須</b></legend><div className="choice-row two">
          <label className="radio"><input type="radio" name="firstTime" value="yes" required/><span>初参加です</span></label>
          <label className="radio"><input type="radio" name="firstTime" value="no" required/><span>参加経験あり</span></label>
        </div></fieldset>
        <label><span>話してみたいこと <i>任意</i></span><textarea name="topic" rows={5} placeholder="気になっているテーマや、みんなに聞いてみたいことがあればご自由にどうぞ。"/></label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="submit">この内容で申し込む <span>→</span></button>
        <p className="privacy">ご入力いただいた情報は、本イベントの運営・連絡のみに使用します。</p>
      </form>
    </section>
  </main>;
}
