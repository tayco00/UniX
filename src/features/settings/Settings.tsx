import { Download, Monitor, RotateCcw, Upload, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { AppData, Profile, Theme } from "../../domain/model";
import { repository } from "../../infrastructure/repository";

function ProfileForm({
  saved,
  onSave,
  onDirty,
}: {
  saved: Profile;
  onSave: (profile: Profile) => Promise<boolean>;
  onDirty: (dirty: boolean) => void;
}) {
  const [profile, setProfile] = useState(saved);
  const [validation, setValidation] = useState("");
  function change(key: keyof Profile, value: string) {
    const next = { ...profile, [key]: value };
    setProfile(next);
    setValidation("");
    onDirty(JSON.stringify(next) !== JSON.stringify(saved));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !profile.name.trim() ||
      !profile.university.trim() ||
      !profile.studyProgram.trim()
    ) {
      setValidation(
        "Bitte fülle Name, Hochschule und Studiengang aus. Leerzeichen allein genügen nicht.",
      );
      return;
    }
    void onSave(profile).then((success) => {
      if (success)
        setProfile({
          name: profile.name.trim(),
          university: profile.university.trim(),
          studyProgram: profile.studyProgram.trim(),
          semester: profile.semester.trim(),
        });
    });
  }
  return (
    <form className="profile-form" onSubmit={submit}>
      {validation && (
        <p className="error-notice field-wide" role="alert">
          {validation}
        </p>
      )}
      <label className="field">
        <span>Name</span>
        <input
          value={profile.name}
          maxLength={80}
          onChange={(event) => change("name", event.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Hochschule</span>
        <input
          value={profile.university}
          maxLength={120}
          onChange={(event) => change("university", event.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Studiengang</span>
        <input
          value={profile.studyProgram}
          maxLength={120}
          onChange={(event) => change("studyProgram", event.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>
          Semester <small>optional</small>
        </span>
        <input
          value={profile.semester}
          maxLength={40}
          onChange={(event) => change("semester", event.target.value)}
        />
      </label>
      <button className="button button-primary profile-save" type="submit">
        Profil speichern
      </button>
    </form>
  );
}

export function Settings({
  data,
  onUpdateProfile,
  onUpdateTheme,
  onReset,
  onImport,
  onExport,
  onDirty,
}: {
  data: AppData;
  onUpdateProfile: (profile: Profile) => Promise<boolean>;
  onUpdateTheme: (theme: Theme) => Promise<void>;
  onReset: () => Promise<void>;
  onImport: () => Promise<void>;
  onExport: () => Promise<void>;
  onDirty: (dirty: boolean) => void;
}) {
  const [version, setVersion] = useState("");
  useEffect(() => {
    void repository
      .getAppInfo()
      .then((info) => setVersion(info.version))
      .catch(() => setVersion(""));
  }, []);
  return (
    <div className="page settings-page">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">EINSTELLUNGEN</p>
          <h1>Dein UniX.</h1>
          <p>Dein Studienprofil, deine Darstellung und deine Sicherungen.</p>
        </div>
      </header>
      <div className="settings-layout">
        <section className="panel settings-section">
          <header>
            <div className="section-icon">
              <UserRound size={18} />
            </div>
            <div>
              <h2>Studienprofil</h2>
              <p>Deine Angaben für die persönliche Übersicht.</p>
            </div>
          </header>
          <ProfileForm
            key={JSON.stringify(data.profile)}
            saved={data.profile}
            onSave={onUpdateProfile}
            onDirty={onDirty}
          />
        </section>
        <section className="panel settings-section">
          <header>
            <div className="section-icon">
              <Monitor size={18} />
            </div>
            <div>
              <h2>Darstellung</h2>
              <p>„System“ folgt deiner Windows-Einstellung.</p>
            </div>
          </header>
          <div className="theme-options" role="group" aria-label="Farbschema">
            {(["system", "light", "dark"] as Theme[]).map((theme) => (
              <button
                type="button"
                key={theme}
                className={data.settings.theme === theme ? "active" : ""}
                aria-pressed={data.settings.theme === theme}
                onClick={() => void onUpdateTheme(theme)}
              >
                <span className={`theme-preview ${theme}`}>
                  <i />
                  <i />
                </span>
                {theme === "system"
                  ? "System"
                  : theme === "light"
                    ? "Hell"
                    : "Dunkel"}
              </button>
            ))}
          </div>
        </section>
        <section className="panel settings-section data-section">
          <header>
            <div className="section-icon">
              <Download size={18} />
            </div>
            <div>
              <h2>Sicherung & Wiederherstellung</h2>
              <p>Bewahre eine Kopie von Profil und Aufgaben auf.</p>
            </div>
          </header>
          <p className="section-copy">
            Exportiere regelmäßig eine Sicherung, zum Beispiel auf ein anderes
            Laufwerk. Beim Wiederherstellen ersetzt die gewählte Datei dein
            aktuelles Profil und alle Aufgaben. Ungespeicherte Profiländerungen
            sind nicht im Export enthalten.
          </p>
          {!window.unixApi && (
            <p className="section-copy">
              Sicherungen stehen in der Windows-App zur Verfügung, nicht in
              dieser Browser-Vorschau.
            </p>
          )}
          <div className="data-buttons">
            <button
              disabled={!window.unixApi}
              className="button button-quiet"
              type="button"
              onClick={() => void onExport()}
            >
              <Download size={16} /> Sicherung exportieren
            </button>
            <button
              disabled={!window.unixApi}
              className="button button-quiet"
              type="button"
              onClick={() => void onImport()}
            >
              <Upload size={16} /> Wiederherstellen
            </button>
          </div>
        </section>
        <section className="panel settings-section danger-section">
          <header>
            <div className="section-icon danger">
              <RotateCcw size={18} />
            </div>
            <div>
              <h2>Neu beginnen</h2>
              <p>Setzt dein Profil und alle Aufgaben zurück.</p>
            </div>
          </header>
          <button
            className="button button-danger"
            type="button"
            onClick={() => void onReset()}
          >
            UniX zurücksetzen
          </button>
          {version && <p className="version-label">UniX {version}</p>}
        </section>
      </div>
    </div>
  );
}
