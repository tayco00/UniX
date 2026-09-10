import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Database, Sparkles } from "lucide-react";
import { Logo } from "../../components/Logo";
import type { Profile } from "../../domain/model";

export function Onboarding({ onComplete }: { onComplete: (profile: Profile, withDemo: boolean) => void }) {
  const [profile, setProfile] = useState<Profile>({ name: "", university: "", studyProgram: "", semester: "" });
  const [withDemo, setWithDemo] = useState(true);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!profile.name.trim() || !profile.university.trim() || !profile.studyProgram.trim()) return;
    onComplete({
      name: profile.name.trim(),
      university: profile.university.trim(),
      studyProgram: profile.studyProgram.trim(),
      semester: profile.semester.trim(),
    }, withDemo);
  }

  return (
    <main className="onboarding-shell">
      <section className="onboarding-story">
        <Logo />
        <div className="story-copy">
          <p className="eyebrow light">DEIN STUDIUM. DEIN SYSTEM.</p>
          <h1>Weniger suchen.<br />Mehr schaffen.</h1>
          <p>UniX bringt Fristen, Fokus und Studienorganisation an einen ruhigen Ort – lokal auf deinem Gerät.</p>
        </div>
        <ul className="story-points">
          <li><span><Check size={14} /></span> Ohne Konto startklar</li>
          <li><span><Check size={14} /></span> Funktioniert vollständig offline</li>
          <li><span><Check size={14} /></span> Deine Daten bleiben bei dir</li>
        </ul>
        <p className="story-foot">MVP 0.1 · Local-first für Windows</p>
      </section>
      <section className="onboarding-form-wrap">
        <form className="onboarding-form" onSubmit={submit}>
          <div className="step-indicator"><span>1</span><i /><span className="muted-step">2</span></div>
          <p className="eyebrow">PERSÖNLICHER START</p>
          <h2>Mach UniX zu deinem Ort.</h2>
          <p className="form-intro">Drei Angaben genügen. Du kannst alles später ändern.</p>
          <label className="field field-wide"><span>Vorname</span><input autoFocus value={profile.name} maxLength={80} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Wie dürfen wir dich begrüßen?" required /></label>
          <label className="field field-wide"><span>Hochschule</span><input value={profile.university} maxLength={120} onChange={(event) => setProfile({ ...profile, university: event.target.value })} placeholder="z. B. HTW Dresden" required /></label>
          <div className="onboarding-grid">
            <label className="field"><span>Studiengang</span><input value={profile.studyProgram} maxLength={120} onChange={(event) => setProfile({ ...profile, studyProgram: event.target.value })} placeholder="Wirtschaftsinformatik" required /></label>
            <label className="field"><span>Semester <small>optional</small></span><input value={profile.semester} maxLength={40} onChange={(event) => setProfile({ ...profile, semester: event.target.value })} placeholder="3. Semester" /></label>
          </div>
          <button type="button" className={`demo-choice ${withDemo ? "selected" : ""}`} onClick={() => setWithDemo((current) => !current)} aria-pressed={withDemo}>
            <span className="choice-icon"><Sparkles size={18} /></span>
            <span><strong>Mit drei Beispielen starten</strong><small>Hilft dir, UniX in einer Minute kennenzulernen.</small></span>
            <span className="choice-check">{withDemo && <Check size={14} />}</span>
          </button>
          <button className="button button-primary button-large" type="submit">UniX einrichten <ArrowRight size={17} /></button>
          <p className="privacy-note"><Database size={14} /> Diese Angaben werden nur lokal auf deinem PC gespeichert.</p>
        </form>
      </section>
    </main>
  );
}
