import { Download, RotateCcw, Upload, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { Profile } from "../domain/model";
import { repository } from "../infrastructure/repository";

export function Settings({
  saved,
  onSave,
  onExport,
  onImport,
  onReset,
  onDirty,
}: {
  saved: Profile;
  onSave: (profile: Profile) => Promise<boolean>;
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
  onReset: () => Promise<void>;
  onDirty: (dirty: boolean) => void;
}) {
  const [profile, setProfile] = useState(saved);
  const [version, setVersion] = useState("");
  const [validation, setValidation] = useState("");
  useEffect(() => {
    void repository.info().then((info) => setVersion(info.version));
  }, []);
  const update = (key: keyof Profile, value: string) => {
    const next = { ...profile, [key]: value };
    setProfile(next);
    setValidation("");
    onDirty(JSON.stringify(next) !== JSON.stringify(saved));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      !profile.firstName.trim() ||
      !profile.university.trim() ||
      !profile.courseOfStudy.trim()
    ) {
      setValidation("Bitte fülle Vorname, Hochschule und Studiengang aus.");
      return;
    }
    const next = {
      firstName: profile.firstName.trim(),
      university: profile.university.trim(),
      courseOfStudy: profile.courseOfStudy.trim(),
      semester: profile.semester.trim(),
    };
    void onSave(next).then((success) => {
      if (success) setProfile(next);
    });
  };
  return (
    <div className="page settings-page">
      <header className="page-heading">
        <div>
          <p className="section-label">UniX</p>
          <h1>Einstellungen</h1>
          <p>Dein Profil und deine Sicherungen.</p>
        </div>
      </header>
      <div className="settings-sections">
        <section className="settings-block">
          <header>
            <UserRound size={20} />
            <div>
              <h2>Studienprofil</h2>
              <p>So personalisiert UniX deine Übersicht.</p>
            </div>
          </header>
          <form className="profile-form" onSubmit={submit}>
            {validation && (
              <p className="notice error field-wide" role="alert">
                {validation}
              </p>
            )}
            <label className="field">
              <span>Vorname</span>
              <input
                maxLength={80}
                value={profile.firstName}
                onChange={(event) => update("firstName", event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Hochschule</span>
              <input
                maxLength={120}
                value={profile.university}
                onChange={(event) => update("university", event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Studiengang</span>
              <input
                maxLength={120}
                value={profile.courseOfStudy}
                onChange={(event) =>
                  update("courseOfStudy", event.target.value)
                }
                required
              />
            </label>
            <label className="field">
              <span>
                Semester <small>(optional)</small>
              </span>
              <input
                maxLength={40}
                value={profile.semester}
                onChange={(event) => update("semester", event.target.value)}
              />
            </label>
            <button className="button primary profile-save">
              Profil speichern
            </button>
          </form>
        </section>
        <section className="settings-block">
          <header>
            <Download size={20} />
            <div>
              <h2>Sicherung</h2>
              <p>Exportiere Profil und Aufgaben als eine Datei.</p>
            </div>
          </header>
          <div className="settings-content">
            <p>
              Beim Wiederherstellen ersetzt die gewählte Sicherung dein
              aktuelles Profil und alle Aufgaben. Ungespeicherte Änderungen sind
              nicht enthalten.
            </p>
            <div className="button-row">
              <button
                className="button secondary"
                disabled={!window.unixApi}
                onClick={() => void onExport()}
              >
                <Download size={16} /> Sicherung exportieren
              </button>
              <button
                className="button secondary"
                disabled={!window.unixApi}
                onClick={() => void onImport()}
              >
                <Upload size={16} /> Wiederherstellen
              </button>
            </div>
          </div>
        </section>
        <section className="settings-block danger-zone">
          <header>
            <RotateCcw size={20} />
            <div>
              <h2>Neu beginnen</h2>
              <p>Entfernt dein Profil und alle Aufgaben.</p>
            </div>
          </header>
          <div className="settings-content">
            <button className="button danger" onClick={() => void onReset()}>
              UniX zurücksetzen
            </button>
            {version && <small>Version {version}</small>}
          </div>
        </section>
      </div>
    </div>
  );
}
