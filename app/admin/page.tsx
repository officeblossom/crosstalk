"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Location = { id: number; name: string; slug: string; venue: string; address: string; keyColor: string; lastCount: number };
type EventItem = { id: number; slug: string; edition: number; eventDate: string; venue: string; address: string; locationName: string; isOpen: boolean; registrationCount: number };

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [error, setError] = useState("");
  const location = useMemo(() => locations.find((x) => x.id === selected) ?? locations[0], [locations, selected]);

  async function load(pass = password) {
    const res = await fetch("/api/admin", { headers: { "x-admin-password": pass } });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setAuthed(false); return; }
    setLocations(data.locations); setEvents(data.events); setSelected((v) => v || data.locations[0]?.id); setAuthed(true); setError("");
    sessionStorage.setItem("ct-admin", pass);
  }
  useEffect(() => { const saved = sessionStorage.getItem("ct-admin"); if (saved) { setPassword(saved); void load(saved); } }, []);

  async function action(payload: Record<string, unknown>) {
    const res = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json", "x-admin-password": password }, body: JSON.stringify(payload) });
    const data = await res.json(); if (!res.ok) return setError(data.error ?? "操作できませんでした"); await load();
  }
  async function createEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    await action({ action: "createEvent", locationId: location.id, edition: data.get("edition"), eventDate: data.get("date"), venue: data.get("venue"), address: data.get("address") });
    e.currentTarget.reset();
  }
  async function createLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    await action({ action: "createLocation", name: data.get("name"), slug: data.get("slug"), venue: data.get("venue"), address: data.get("address"), keyColor: data.get("keyColor"), lastCount: data.get("lastCount") });
    e.currentTarget.reset();
  }
  function copy(slug: string) { navigator.clipboard.writeText(`${window.location.origin}/e/${slug}`); }

  if (!authed) return <main className="admin-login"><form onSubmit={(e) => { e.preventDefault(); void load(); }}><Link href="/" className="brand">CROSS TALK<span>.</span></Link><p>MANAGEMENT</p><h1>運営管理画面</h1><label>管理パスコード<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus /></label>{error && <p className="form-error">{error}</p>}<button className="submit">ログイン <span>→</span></button></form></main>;

  return <main className="admin-shell">
    <aside><Link href="/" className="brand">CROSS TALK<span>.</span></Link><nav><a href="#create">イベント作成</a><a href="#events">開催一覧</a><a href="#locations">地域・会場</a></nav><button onClick={() => { sessionStorage.removeItem("ct-admin"); setAuthed(false); }}>ログアウト</button></aside>
    <div className="admin-content">
      <header><div><p>MANAGEMENT</p><h1>イベント管理</h1></div><Link href="/">公開ページを見る ↗</Link></header>
      <section className="admin-stats"><div><span>登録地域</span><strong>{locations.length}</strong></div><div><span>公開中イベント</span><strong>{events.filter((x) => x.isOpen).length}</strong></div><div><span>申込者数</span><strong>{events.reduce((n, x) => n + Number(x.registrationCount), 0)}</strong></div></section>
      <section className="admin-panel" id="create"><div className="panel-title"><span>01</span><div><p>CREATE EVENT</p><h2>新しいフォームを作る</h2></div></div>
        {location && <form className="create-form" onSubmit={createEvent}>
          <label>開催地域<select value={location.id} onChange={(e) => setSelected(Number(e.target.value))}>{locations.map((x) => <option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
          <label>開催回数<input name="edition" type="number" min="1" key={`edition-${location.id}-${location.lastCount}`} defaultValue={location.lastCount + 1} required /></label>
          <label>開催日<input name="date" type="date" required /></label>
          <label className="wide">会場名<input name="venue" key={`venue-${location.id}`} defaultValue={location.venue} required /></label>
          <label className="wide">会場住所<input name="address" key={`address-${location.id}`} defaultValue={location.address} required /></label>
          <div className="preview-title"><small>生成されるタイトル</small><strong>第{location.lastCount + 1}回 Cross Talk{location.name}</strong></div>
          <button className="admin-primary">フォームを生成する ＋</button>
        </form>}
      </section>
      <section className="admin-panel" id="events"><div className="panel-title"><span>02</span><div><p>EVENTS</p><h2>開催フォーム一覧</h2></div></div>
        <div className="event-table">{events.length ? events.map((x) => <article key={x.id}><div><span className={x.isOpen ? "status-open" : "status-closed"}>{x.isOpen ? "受付中" : "受付終了"}</span><h3>第{x.edition}回 Cross Talk{x.locationName}</h3><p>{x.eventDate} ・ {x.venue}<br/>{x.address}</p></div><strong>{x.registrationCount}<small>名</small></strong><div className="table-actions"><button onClick={() => copy(x.slug)}>URLをコピー</button><a href={`/e/${x.slug}`} target="_blank" rel="noopener noreferrer">開く ↗</a><button onClick={() => action({ action: "toggleEvent", eventId: x.id, isOpen: !x.isOpen })}>{x.isOpen ? "受付終了" : "再公開"}</button></div></article>) : <p className="admin-empty">まだイベントはありません。</p>}</div>
      </section>
      <section className="admin-panel" id="locations"><div className="panel-title"><span>03</span><div><p>LOCATIONS</p><h2>地域・会場の追加</h2></div></div>
        <div className="location-chips">{locations.map((x) => <div key={x.id} style={{borderTopColor:x.keyColor}}><strong>{x.name}</strong><span>{x.venue}<br/>{x.address}</span><small>{x.keyColor} ・ 開催済み {x.lastCount}回</small></div>)}</div>
        <form className="create-form location-form" onSubmit={createLocation}><label>地域名<input name="name" placeholder="例：Kokura" required/></label><label>URL名（半角英数）<input name="slug" placeholder="kokura" pattern="[a-zA-Z0-9-]+" required/></label><label>開催済み回数<input name="lastCount" type="number" min="0" defaultValue="0"/></label><label>キーカラー<input name="keyColor" type="color" defaultValue="#42210b" required/></label><label className="wide">デフォルト会場<input name="venue" placeholder="会場名" required/></label><label className="wide">会場住所<input name="address" placeholder="郵便番号・住所" required/></label><button className="admin-primary">地域を追加する ＋</button></form>
      </section>
      {error && <div className="admin-error">{error}</div>}
    </div>
  </main>;
}
