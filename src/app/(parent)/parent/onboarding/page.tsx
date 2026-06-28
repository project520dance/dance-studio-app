"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCurrentUser } from "@/services/authService";
import { completeParentOnboarding } from "@/services/onboardingService";
import { getUserProfile } from "@/services/userService";

type DancerDraft = {
  firstName: string;
  lastName: string;
  birthdate: string;
  medicalConditions: string;
  currentMedications: string;
  physician: string;
  allergies: string;
  additionalNotes: string;
};

const emptyDancer: DancerDraft = {
  firstName: "",
  lastName: "",
  birthdate: "",
  medicalConditions: "",
  currentMedications: "",
  physician: "",
  allergies: "",
  additionalNotes: "",
};

const stepTitles = [
  "Family information",
  "Add a dancer",
  "Health information",
  "Review your family",
];

export default function ParentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", phone: "", relationship: "" },
    { name: "", phone: "", relationship: "" },
  ]);
  const [dancers, setDancers] = useState<DancerDraft[]>([
    { ...emptyDancer },
  ]);
  const [activeDancerIndex, setActiveDancerIndex] = useState(0);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const activeDancer = dancers[activeDancerIndex];

  function updateContact(
    index: number,
    field: "name" | "phone" | "relationship",
    value: string,
  ) {
    setEmergencyContacts((current) =>
      current.map((contact, contactIndex) =>
        contactIndex === index
          ? { ...contact, [field]: value }
          : contact,
      ),
    );
  }

  function updateDancer(field: keyof DancerDraft, value: string) {
    setDancers((current) =>
      current.map((dancer, dancerIndex) =>
        dancerIndex === activeDancerIndex
          ? { ...dancer, [field]: value }
          : dancer,
      ),
    );
  }

  function addAnotherDancer() {
    setDancers((current) => [...current, { ...emptyDancer }]);
    setActiveDancerIndex(dancers.length);
    setStep(2);
  }

  function goBack() {
    if (step === 2 && activeDancerIndex > 0) {
      setStep(4);
      return;
    }

    setStep((current) => Math.max(1, current - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSaving(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        setError(
          "We could not find your studio profile. Please contact the studio for help.",
        );
        return;
      }

      await completeParentOnboarding({
        userId: user.uid,
        parentLastName: profile.lastName,
        family: { phone, emergencyContacts },
        dancers,
      });
      router.replace("/parent");
    } catch {
      setError(
        "We couldn’t finish registration. Please check your information and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-purple-600">
        Step {step} of 4
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
          style={{ width: `${step * 25}%` }}
        />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {stepTitles[step - 1]}
      </h1>
      <p className="mt-2 text-slate-600">
        Let’s get your family ready for Project 520.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {step === 1 && (
          <div className="space-y-8">
            <Input
              label="Parent phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
            {emergencyContacts.map((contact, index) => (
              <fieldset key={index} className="space-y-5">
                <legend className="font-semibold">
                  Emergency Contact {index + 1}
                </legend>
                <Input
                  label="Name"
                  name={`emergencyContact${index + 1}Name`}
                  value={contact.name}
                  onChange={(event) =>
                    updateContact(index, "name", event.target.value)
                  }
                  required
                />
                <Input
                  label="Phone"
                  name={`emergencyContact${index + 1}Phone`}
                  type="tel"
                  value={contact.phone}
                  onChange={(event) =>
                    updateContact(index, "phone", event.target.value)
                  }
                  required
                />
                <Input
                  label="Relationship"
                  name={`emergencyContact${index + 1}Relationship`}
                  placeholder="Grandparent, family friend, etc."
                  value={contact.relationship}
                  onChange={(event) =>
                    updateContact(
                      index,
                      "relationship",
                      event.target.value,
                    )
                  }
                  required
                />
              </fieldset>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm font-medium text-purple-600">
              Dancer {activeDancerIndex + 1}
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="First name"
                name="dancerFirstName"
                value={activeDancer.firstName}
                onChange={(event) =>
                  updateDancer("firstName", event.target.value)
                }
                required
              />
              <Input
                label="Last name"
                name="dancerLastName"
                value={activeDancer.lastName}
                onChange={(event) =>
                  updateDancer("lastName", event.target.value)
                }
                required
              />
            </div>
            <Input
              label="Birthdate"
              name="birthdate"
              type="date"
              value={activeDancer.birthdate}
              onChange={(event) =>
                updateDancer("birthdate", event.target.value)
              }
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm font-medium text-purple-600">
              Health information for {activeDancer.firstName}
            </p>
            <Input
              label="Medical conditions"
              name="medicalConditions"
              placeholder="Enter none if not applicable"
              value={activeDancer.medicalConditions}
              onChange={(event) =>
                updateDancer("medicalConditions", event.target.value)
              }
              required
            />
            <Input
              label="Current medications"
              name="currentMedications"
              placeholder="Enter none if not applicable"
              value={activeDancer.currentMedications}
              onChange={(event) =>
                updateDancer("currentMedications", event.target.value)
              }
              required
            />
            <Input
              label="Physician"
              name="physician"
              value={activeDancer.physician}
              onChange={(event) =>
                updateDancer("physician", event.target.value)
              }
              required
            />
            <Input
              label="Allergies"
              name="allergies"
              placeholder="Enter none if not applicable"
              value={activeDancer.allergies}
              onChange={(event) =>
                updateDancer("allergies", event.target.value)
              }
              required
            />
            <Input
              label="Additional notes"
              name="additionalNotes"
              value={activeDancer.additionalNotes}
              onChange={(event) =>
                updateDancer("additionalNotes", event.target.value)
              }
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-semibold">Family details</h2>
            <p className="mt-2 text-sm text-slate-600">
              Parent phone: {phone}
            </p>
            <div className="mt-6 space-y-4">
              {dancers.map((dancer, index) => (
                <article
                  key={`${dancer.firstName}-${index}`}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <h3 className="font-semibold">
                    {dancer.firstName} {dancer.lastName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Birthdate: {dancer.birthdate}
                  </p>
                  <p className="text-sm text-slate-600">
                    Allergies: {dancer.allergies}
                  </p>
                </article>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-5"
              onClick={addAnotherDancer}
            >
              Add another dancer
            </Button>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              disabled={isSaving}
            >
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isSaving}>
            {step === 4
              ? isSaving
                ? "Saving..."
                : "Finish registration"
              : "Next"}
          </Button>
        </div>
      </form>
    </section>
  );
}
