"use client";

import Link from "next/link";

// Required consent checkbox shown on every account-creation form. The parent
// keeps the checked state and uses it to disable the submit button until the
// guest agrees to the privacy policy and terms.
export function ConsentCheckbox({
  locale,
  checked,
  onChange,
}: {
  locale: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const fr = locale !== "en";
  return (
    <label className="flex cursor-pointer select-none items-start gap-2.5">
      <input
        type="checkbox"
        name="consent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-300 text-terracotta accent-terracotta focus:ring-2 focus:ring-terracotta/30"
      />
      <span className="text-xs leading-relaxed text-muted">
        {fr ? "En créant un compte, j'accepte la " : "By creating an account, I agree to the "}
        <Link
          href={`/${locale}/legal/privacy`}
          target="_blank"
          className="font-medium text-terracotta hover:underline"
        >
          {fr ? "politique de confidentialité" : "privacy policy"}
        </Link>
        {fr ? " et les " : " and the "}
        <Link
          href={`/${locale}/legal/terms`}
          target="_blank"
          className="font-medium text-terracotta hover:underline"
        >
          {fr ? "conditions générales" : "terms & conditions"}
        </Link>
        {fr ? " du Mbn Riad." : " of Mbn Riad."}
      </span>
    </label>
  );
}
