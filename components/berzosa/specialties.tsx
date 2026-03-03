const specialties = [
  {
    number: "01",
    title: "Neurociencia del Rendimiento",
    description:
      "Optimización cognitiva, gestión de la atención y el foco, y desarrollo de estados mentales de alto rendimiento. Para quienes quieren operar al máximo nivel sin quemarse.",
    tags: ["Foco", "Cognición", "Rendimiento"],
  },
  {
    number: "02",
    title: "Neurobiología del Trauma",
    description:
      "Comprensión y abordaje de las huellas que el trauma deja en el sistema nervioso. Un proceso basado en evidencia para recuperar la regulación y la libertad emocional.",
    tags: ["Trauma", "Sistema Nervioso", "Regulación"],
  },
  {
    number: "03",
    title: "Transformación Personal",
    description:
      "Acompañamiento intensivo para quienes buscan un cambio profundo. Herramientas neurocientíficas aplicadas al desarrollo personal, la identidad y el propósito.",
    tags: ["Identidad", "Cambio", "Propósito"],
  },
];

export default function Specialties() {
  return (
    <section id="especialidades" className="bg-[#111111] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
          <div>
            <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
              Especialidades
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight text-balance">
              Tres áreas,<br />una misma dirección
            </h2>
          </div>
          <p className="text-[#6b6b6b] max-w-xs leading-relaxed font-sans text-sm">
            Cada proceso es único. Cada herramienta, elegida con precisión.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-[#1e1e1e]">
          {specialties.map((s) => (
            <div
              key={s.number}
              className="bg-[#111111] p-10 flex flex-col gap-6 group hover:bg-[#080808] transition-colors duration-300"
            >
              <span className="font-serif text-6xl text-[#1e1e1e] group-hover:text-[#00c8b4]/20 transition-colors duration-500 leading-none select-none">
                {s.number}
              </span>
              <div>
                <h3 className="font-serif text-xl text-[#f0ede8] mb-4 leading-snug">
                  {s.title}
                </h3>
                <p className="text-[#6b6b6b] leading-relaxed text-sm font-sans">
                  {s.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-[#1e1e1e]">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[#00c8b4] text-xs tracking-widest uppercase border border-[#00c8b4]/30 px-3 py-1 font-sans"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
