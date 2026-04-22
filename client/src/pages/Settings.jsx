const settings = [
  { label: "Frontend", value: "Vite + React + Tailwind + Framer Motion" },
  { label: "API", value: "Express + Zod + Helmet" },
  { label: "Policy", value: "No auto-send, explicit confirmation required" }
];

export default function Settings() {
  return (
    <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">Architecture Settings</p>
      <div className="mt-6 grid gap-4">
        {settings.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-white/60 bg-white/80 p-4"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">{item.label}</p>
            <p className="mt-2 text-ma-black">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
