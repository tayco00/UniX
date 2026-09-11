import { ArrowRight, CalendarCheck, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Logo } from "../components/Logo";
import type { Profile } from "../domain/model";

export function Onboarding({
  busy,
  error,
  onComplete,
  onDirty,
}: {
  busy: boolean;
  error: string;
  onComplete: (profile: Profile) => Promise<void>;
  onDirty: (dirty: boolean) => void;
}) {
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    university: "",
    courseOfStudy: "",
    semester: "",
  });
  const [validation, setValidation] = useState("");
  const update = (key: keyof Profile, value: string) => {
    setProfile({ ...profile, [key]: value });
    setValidation("");
    onDirty(true);
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
    void onComplete({
      firstName: profile.firstName.trim(),
      university: profile.university.trim(),
      courseOfStudy: profile.courseOfStudy.trim(),
      semester: profile.semester.trim(),
    });
  };
  return (
    <main className="onboarding">
      <section className="onboarding-intro">
        <Logo />
        <div className="intro-copy">
          <span className="soft-badge">
            <Sparkles size={15} /> Dein Semester, klar sortiert
          </span>
          <h1>
            Weniger suchen.
            <br />
            Mehr schaffen.
          </h1>
          <p>
            UniX bringt Aufgaben, Fristen und Lernzeiten in eine Übersicht, die
            sich leicht anfühlt.
          </p>
        </div>
        <div className="intro-preview" aria-hidden="true">
          <div>
            <CalendarCheck size={20} />
            <span>
              <b>Statistik lernen</b>
              <small>Morgen · 90 Min.</small>
            </span>
            <i />
          </div>
          <div>
            <CalendarCheck size={20} />
            <span>
              <b>Projekt abgeben</b>
              <small>Freitag · 45 Min.</small>
            </span>
            <i />
          </div>
        </div>
      </section>
      <section className="onboarding-form-side">
        <form
          className="onboarding-form"
          onSubmit={submit}
          aria-busy={busy}
          noValidate
        >
          <p className="section-label">Willkommen</p>
          <h2>Richte UniX für dich ein.</h2>
          <p className="form-lead">
            Drei Angaben genügen. Du kannst sie später ändern.
          </p>
          {(validation || error) && (
            <p className="notice error" role="alert">
              {validation || error}
            </p>
          )}
          <fieldset className="onboarding-fields" disabled={busy}>
            <label className="field">
              <span>Vorname</span>
              <input
                autoFocus
                autoComplete="given-name"
                maxLength={80}
                value={profile.firstName}
                onChange={(event) => update("firstName", event.target.value)}
                placeholder="Wie heißt du?"
                required
              />
            </label>
            <label className="field">
              <span>Hochschule</span>
              <input
                maxLength={120}
                value={profile.university}
                onChange={(event) => update("university", event.target.value)}
                placeholder="z. B. HTW Dresden"
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
                placeholder="z. B. Wirtschaftsinformatik"
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
                placeholder="z. B. 3. Semester"
              />
            </label>
            <button className="button primary large" type="submit">
              {busy ? "Wird eingerichtet …" : "UniX einrichten"}
              <ArrowRight size={17} />
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
