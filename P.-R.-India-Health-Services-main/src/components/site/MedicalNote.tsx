import { Info } from "lucide-react";

export function MedicalNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-section p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        Submission of a service request does not constitute medical advice, diagnosis or treatment,
        and does not guarantee service availability. Healthcare services and equipment are subject
        to professional assessment, suitability and availability. For medical emergencies, contact
        your local emergency medical service or visit the nearest emergency department.
      </p>
    </div>
  );
}
