"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Location = { id: number; name: string; slug: string; venue: string; address: string; keyColor: string; lastCount: number };
type EventItem = { id: number; slug: string; edition: number; eventDate: string; venue: string; address: string; participationFee: string; oneDrinkOrder: boolean; locationName: string; isOpen: boolean; registrationCount: number };
type Registration = { id: number; eventId: number; name: string; status: string; affiliation: string; isFirstTime: boolean; topic: string; createdAt: string };

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number>(0);
  const [selected, setSelected] = useState<number>(0);
  const [error, setError] = useState("");
  const location = useMemo(() => locations.find((x) => x.id === selected) ?? locations[0], [locations, selected]);

  async function load(pass = password) {
    const res = await fetch("/api/admin", { headers: { "x-admin-password": pass } });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setAuthed(false); return; }
    setLocations(data.locations); setEvents(data.events); setRegistrations(data.registrations ?? []); setSelected((v) => v || data.locations[0]?.id); setSelectedEvent((v) => v || data.events[0]?.id || 0); setAuthed(true); setError("");
    sessionStorage.setItem("ct-admin", pass);
  }
  useEffect(() => { const saved = sessionStorage.getItem("ct-admin"); if (saved) { setPassword(saved); void load(saved); } }, []);

  async function action(payload: Record<string, unknown>) {
    const res = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json", "x-admin-password": password }, body: JSON.stringify(payload) });
    const data = await res.json(); if (!res.ok) return setError(data.error ?? "操作できませんでした"); await load();
  }
  async function deleteEvent(event: EventItem) {
    if (!window.confirm(`第${event.edition}回 Cross Talk${event.locationName}を削除しますか？\nこのフォームの申込者情報も削除され、元に戻せません。`)) return;
    await action({ action: "deleteEvent", eventId: event.id });
    setSelectedEvent(0);
  }
  async function createEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    await action({ action: "createEvent", locationId: location.id, edition: data.get("edition"), eventDate: data.get("date"), venue: data.get("venue"), address: data.get("address"), participationFee: data.get("participationFee"), oneDrinkOrder: data.get("oneDrinkOrder") === "on" });
    e.currentTarget.reset();
  }
  async function createLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    await action({ action: "createLocation", name: data.get("name"), slug: data.get("slug"), venue: data.get("venue"), address: data.get("address"), keyColor: data.get("keyColor"), lastCount: data.get("lastCount") });
    e.currentTarget.reset();
  }
  function copy(slug: string) { navigator.clipboard.writeText(`${window.location.origin}/e/${slug}`); }
  async function downloadQr(event: EventItem) {
    const QRCode = await import("qrcode");
    const url = `${window.location.origin}/e/${event.slug}`;
    const png = await QRCode.toDataURL(url, { width: 1200, margin: 3, errorCorrectionLevel: "H", color: { dark: "#211711", light: "#f1e6d4" } });
    const link = document.createElement("a");
    link.href = png;
    link.download = `CrossTalk-${event.locationName}-${event.edition}-QR.png`;
    link.click();
  }

  if (!authed) return <main className="admin-login"><form onSubmit={(e) => { e.preventDefault(); void load(); }}><a href="/" className="home-logo" aria-label="トップへ戻る"><img src="/logoA.png" alt="Cross Talk"/></a><p>MANAGEMENT</p><h1>運営管理画面</h1><label>管理パスコード<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus /></label>{error && <p className="form-error">{error}</p>}<button className="submit">ログイン <span>→</span></button></form></main>;

  return <main className="admin-shell">
    <aside><a href="/" className="home-logo inverse" aria-label="トップへ戻る"><img src="/logoA.png" alt="Cross Talk"/></a><nav><a href="#create">イベント作成</a><a href="#events">開催一覧</a><a href="#attendees">申込者一覧</a><a href="#locations">地域・会場</a></nav><button onClick={() => { sessionStorage.removeItem("ct-admin"); setAuthed(false); }}>ログアウト</button></aside>
    <div className="admin-content">
      <header><div><p>MANAGEMENT</p><h1>イベント管理</h1></div><a href="/">公開ページを見る ↗</a></header>
      <section className="admin-stats"><div><span>登録地域</span><strong>{locations.length}</strong></div><div><span>公開中イベント</span><strong>{events.filter((x) => x.isOpen).length}</strong></div><div><span>申込者数</span><strong>{events.reduce((n, x) => n + Number(x.registrationCount), 0)}</strong></div></section>
      <section className="admin-panel" id="create"><div className="panel-title"><span>01</span><div><p>CREATE EVENT</p><h2>新しいフォームを作る</h2></div></div>
        {location && <form className="create-form" onSubmit={createEvent}>
          <label>開催地域<select value={location.id} onChange={(e) => setSelected(Number(e.target.value))}>{locations.map((x) => <option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
          <label>開催回数<input name="edition" type="number" min="1" key={`edition-${location.id}-${location.lastCount}`} defaultValue={location.lastCount + 1} required /></label>
          <label>開催日<input name="date" type="date" required /></label>
          <label className="wide">会場名<input name="venue" key={`venue-${location.id}`} defaultValue={location.venue} required /></label>
          <label className="wide">会場住所<input name="address" key={`address-${location.id}`} defaultValue={location.address} required /></label>
          <label>参加費<input name="participationFee" placeholder="例：1,000円 / 無料" /></label>
          <label className="check-label"><input name="oneDrinkOrder" type="checkbox" />ワンドリンクオーダー</label>
          <button className="admin-primary">フォームを生成する ＋</button>
        </form>}
      </section>
      <section className="admin-panel" id="events"><div className="panel-title"><span>02</span><div><p>EVENTS</p><h2>開催フォーム一覧</h2></div></div>
        <div className="event-table">{events.length ? events.map((x) => <article key={x.id}><div><span className={x.isOpen ? "status-open" : "status-closed"}>{x.isOpen ? "受付中" : "受付終了"}</span><h3>第{x.edition}回 Cross Talk{x.locationName}</h3><p>{x.eventDate} ・ {x.venue}<br/>{x.address}{x.participationFee && <><br/>参加費：{x.participationFee}{x.oneDrinkOrder ? "（ワンドリンクオーダー）" : ""}</>}</p></div><strong>{x.registrationCount}<small>名</small></strong><div className="table-actions"><button onClick={() => copy(x.slug)}>URLをコピー</button><button onClick={() => void downloadQr(x)}>QRをPNG保存</button><a href={`/e/${x.slug}`} target="_blank" rel="noopener noreferrer">開く ↗</a><button onClick={() => action({ action: "toggleEvent", eventId: x.id, isOpen: !x.isOpen })}>{x.isOpen ? "受付終了" : "再公開"}</button><button className="danger-action" onClick={() => void deleteEvent(x)}>削除</button></div></article>) : <p className="admin-empty">まだイベントはありません。</p>}</div>
      </section>
      <section className="admin-panel" id="attendees"><div className="panel-title"><span>03</span><div><p>ATTENDEES</p><h2>申し込み者一覧</h2></div></div>
        {events.length ? <><label className="event-filter">会場・開催回を選択<select value={selectedEvent} onChange={(e) => setSelectedEvent(Number(e.target.value))}>{events.map((x) => <option value={x.id} key={x.id}>{x.locationName} — 第{x.edition}回（{x.eventDate}）</option>)}</select></label>
        <div className="attendee-list">{registrations.filter((r) => r.eventId === selectedEvent).length ? registrations.filter((r) => r.eventId === selectedEvent).map((r, i) => <article key={r.id}><div className="attendee-number">{String(i + 1).padStart(2,"0")}</div><div><h3>{r.name}</h3><p>{r.affiliation} ・ {{student:"学生",worker:"社会人",other:"その他"}[r.status] ?? r.status} ・ {r.isFirstTime ? "初参加" : "参加経験あり"}</p>{r.topic && <blockquote>{r.topic}</blockquote>}</div><time>{new Date(r.createdAt).toLocaleDateString("ja-JP")}</time></article>) : <p className="admin-empty">この開催回への申し込みはまだありません。</p>}</div></> : <p className="admin-empty">イベントを作成すると申込者を確認できます。</p>}
      </section>
      <section className="admin-panel" id="locations"><div className="panel-title"><span>04</span><div><p>LOCATIONS</p><h2>地域・会場の追加</h2></div></div>
        <div className="location-chips">{locations.map((x) => <div key={x.id} style={{borderTopColor:x.keyColor}}><strong>{x.name}</strong><span>{x.venue}<br/>{x.address}</span><small>{x.keyColor} ・ 開催済み {x.lastCount}回</small></div>)}</div>
        <form className="create-form location-form" onSubmit={createLocation}><label>地域名<input name="name" placeholder="例：Kokura" required/></label><label>URL名（半角英数）<input name="slug" placeholder="kokura" pattern="[a-zA-Z0-9-]+" required/></label><label>開催済み回数<input name="lastCount" type="number" min="0" defaultValue="0"/></label><label>キーカラー<input name="keyColor" type="color" defaultValue="#42210b" required/></label><label className="wide">デフォルト会場<input name="venue" placeholder="会場名" required/></label><label className="wide">会場住所<input name="address" placeholder="郵便番号・住所" required/></label><button className="admin-primary">地域を追加する ＋</button></form>
      </section>
      {error && <div className="admin-error">{error}</div>}
    </div>
  </main>;
}
