import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "../../components/Logo";
import type { Profile } from "../../domain/model";

export function Onboarding({
  onComplete,
  onDirty,
  busy,
  error,
}: {
  onComplete: (profile: Profile) => Promise<void>;
  onDirty: (dirty: boolean) => void;
  busy: boolean;
  error: string;
}) {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    university: "",
    studyProgram: "",
    semester: "",
  });
  const [validation, setValidation] = useState("");
  function change(key: keyof Profile, value: string) {
    setProfile({ ...profile, [key]: value });
    onDirty(true);
    setValidation("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !profile.name.trim() ||
      !profile.university.trim() ||
      !profile.studyProgram.trim()
    ) {
      setValidation(
        "Bitte fülle Vorname, Hochschule und Studiengang aus. Leerzeichen allein genügen nicht.",
      );
      return;
    }
    void onComplete({
      name: profile.name.trim(),
      university: profile.university.trim(),
      studyProgram: profile.studyProgram.trim(),
      semester: profile.semester.trim(),
    });
  }
  return (
    <main className="onboarding-shell">
      <section className="onboarding-story">
        <Logo />
        <div className="story-copy">
          <p className="eyebrow light">DEIN STUDIUM. DEIN SYSTEM.</p>
          <h1>
            Platz für
            <br />
            deinen Plan.
          </h1>
          <p>
            Prüfungen, Abgaben und die nächste Lerneinheit. Mit UniX behältst du
            im Blick, was ansteht — und was schon geschafft ist.
          </p>
        </div>
        <p className="story-foot">UniX</p>
      </section>
      <section className="onboarding-form-wrap">
        <form className="onboarding-form" onSubmit={submit} aria-busy={busy}>
          <p className="eyebrow">Willkommen bei UniX</p>
          <h2>Dein Studium beginnt hier.</h2>
          <p className="form-intro">
            Richte dein Studienprofil ein. Du kannst alle Angaben später ändern.
          </p>
          {(validation || error) && (
            <p role="alert" className="error-notice">
              {validation || error}
            </p>
          )}
          <fieldset
            className="interaction-group onboarding-fields"
            disabled={busy}
          >
            <label className="field">
              <span>Vorname</span>
              <input
                autoFocus
                autoComplete="given-name"
                value={profile.name}
                maxLength={80}
                onChange={(event) => change("name", event.target.value)}
                placeholder="Wie heißt du?"
                required
              />
            </label>
            <label className="field">
              <span>Hochschule</span>
              <input
                value={profile.university}
                maxLength={120}
                onChange={(event) => change("university", event.target.value)}
                placeholder="z. B. HTW Dresden"
                required
              />
            </label>
            <div className="onboarding-grid">
              <label className="field">
                <span>Studiengang</span>
                <input
                  value={profile.studyProgram}
                  maxLength={120}
                  onChange={(event) =>
                    change("studyProgram", event.target.value)
                  }
                  placeholder="z. B. Informatik"
                  required
                />
              </label>
              <label className="field">
                <span>
                  Semester <small>(optional)</small>
                </span>
                <input
                  value={profile.semester}
                  maxLength={40}
                  onChange={(event) => change("semester", event.target.value)}
                  placeholder="z. B. 3. Semester"
                />
              </label>
            </div>
            <button
              className="button button-primary button-large"
              type="submit"
            >
              {busy ? "Wird eingerichtet …" : "UniX einrichten"}
              <ArrowRight size={17} />
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
