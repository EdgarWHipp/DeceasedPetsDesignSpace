'use client';

// Where the visitor says, in their own words, what their afterlife pet is and
// how it shows up. The nine codes give the coordinates; this gives the scenario
// they had in mind, and it travels with them into the Library.

export default function ScenarioNote({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <label
        htmlFor="scenario"
        className="block text-[11px] font-semibold uppercase tracking-widest text-ink/50"
      >
        Your scenario
      </label>
      <textarea
        id="scenario"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Describe the afterlife pet you have in mind, and how it would show up in a life. Whose pet is it, when do they meet it, and what happens?"
        className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink/35 focus:border-ink/30 focus:outline-none"
      />
      <p className="mt-1 text-xs text-ink/50">
        Optional, and it stays in this browser.
      </p>
    </div>
  );
}
