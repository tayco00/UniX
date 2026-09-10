import { Database, Download, FolderOpen, HardDrive, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { AppData, AppInfo, Profile, Theme } from "../../domain/model";
import { repository } from "../../infrastructure/repository";

export function Settings({ data, onUpdateProfile, onUpdateTheme, onReset, onImported, notify }: {
  data: AppData;
  onUpdateProfile: (profile: Profile) => void;
  onUpdateTheme: (theme: Theme) => void;
  onReset: () => void;
  onImported: (data: AppData) => void;
  notify: (message: string) => void;
}) {
  const [profile, setProfile] = useState(data.profile);
  const [info, setInfo] = useState<AppInfo | null>(null);
  useEffect(() => { void repository.getAppInfo().then(setInfo); }, []);

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    onUpdateProfile(profile);
  }

  async function exportBackup() {
    const result = await repository.exportBackup();
    notify(result.canceled ? "Export abgebrochen" : "Backup wurde gespeichert");
  }

  async function importBackup() {
    try {
      const result = await repository.importBackup();
      if (result.data) {
        onImported(result.data);
        notify("Backup wurde wiederhergestellt");
      }
    } catch {
      notify("Backup konnte nicht gelesen werden");
    }
  }

  return (
    <div className="page settings-page">
      <header className="page-title-row"><div><p className="eyebrow">EINSTELLUNGEN</p><h1>Dein UniX.</h1><p>Profil, Darstellung und lokale Daten an einem Ort.</p></div></header>
      <div className="settings-layout">
        <section className="panel settings-section">
          <header><div className="section-icon"><Database size={18} /></div><div><h2>Studienprofil</h2><p>Wird für deine persönliche Übersicht verwendet.</p></div></header>
          <form className="profile-form" onSubmit={saveProfile}>
            <label className="field"><span>Name</span><input value={profile.name} maxLength={80} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label>
            <label className="field"><span>Hochschule</span><input value={profile.university} maxLength={120} onChange={(event) => setProfile({ ...profile, university: event.target.value })} required /></label>
            <label className="field"><span>Studiengang</span><input value={profile.studyProgram} maxLength={120} onChange={(event) => setProfile({ ...profile, studyProgram: event.target.value })} required /></label>
            <label className="field"><span>Semester</span><input value={profile.semester} maxLength={40} onChange={(event) => setProfile({ ...profile, semester: event.target.value })} /></label>
            <button className="button button-primary profile-save" type="submit">Profil speichern</button>
          </form>
        </section>
        <section className="panel settings-section">
          <header><div className="section-icon"><HardDrive size={18} /></div><div><h2>Darstellung</h2><p>Wähle die Oberfläche, die zu dir passt.</p></div></header>
          <div className="theme-options" role="group" aria-label="Farbschema">
            {(["system", "light", "dark"] as Theme[]).map((theme) => <button type="button" key={theme} className={data.settings.theme === theme ? "active" : ""} aria-pressed={data.settings.theme === theme} onClick={() => onUpdateTheme(theme)}><span className={`theme-preview ${theme}`}><i /><i /></span>{theme === "system" ? "System" : theme === "light" ? "Hell" : "Dunkel"}</button>)}
          </div>
        </section>
        <section className="panel settings-section data-section">
          <header><div className="section-icon"><ShieldCheck size={18} /></div><div><h2>Daten & Schutz</h2><p>UniX sendet keine Daten an einen Server.</p></div></header>
          <div className="privacy-callout"><ShieldCheck size={19} /><div><strong>Local-first</strong><p>Profil und Aufgaben liegen ausschließlich im App-Datenordner dieses PCs.</p></div></div>
          <div className="data-path"><FolderOpen size={16} /><span><small>Speicherort</small><strong title={info?.dataPath}>{info?.dataPath ?? "Wird geladen …"}</strong></span></div>
          <div className="data-buttons"><button className="button button-quiet" type="button" onClick={() => void exportBackup()}><Download size={16} /> Backup exportieren</button><button className="button button-quiet" type="button" onClick={() => void importBackup()}><Upload size={16} /> Backup importieren</button></div>
        </section>
        <section className="panel settings-section danger-section">
          <header><div className="section-icon danger"><RotateCcw size={18} /></div><div><h2>Neu beginnen</h2><p>Löscht Aufgaben und Profil aus UniX.</p></div></header>
          <button className="button button-danger" type="button" onClick={onReset}>Lokale Daten zurücksetzen</button>
          <p className="version-label">UniX {info?.version ?? "0.1.0"} · Desktop MVP</p>
        </section>
      </div>
    </div>
  );
}
