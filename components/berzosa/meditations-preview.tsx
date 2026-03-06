import Link from "next/link"

const previews = [
  {
    plan: "free",
    planLabel: "Gratis",
    title: "Respiración 4-7-8",
    description: "Activa el sistema nervioso parasimpático en menos de 5 minutos. Ideal para momentos de alta activación.",
    duration: "5 min",
    category: "Regulación",
  },
  {
    plan: "free",
    planLabel: "Gratis",
    title: "Escaneo corporal básico",
    description: "Reconecta con las señales de tu cuerpo y aprende a distinguir tensión de relajación.",
    duration: "8 min",
    category: "Consciencia",
  },
  {
    plan: "free",
    planLabel: "Gratis",
    title: "Anclaje al presente",
    description: "Técnica de atención selectiva para interrumpir el ciclo de ruido mental en cualquier momento.",
    duration: "6 min",
    category: "Atención",
  },
  {
    plan: "premium",
    planLabel: "Premium",
    title: "Reprogramación de creencias",
    description: "Trabaja el diálogo interno y sustituye patrones automáticos por narrativas que te impulsan.",
    duration: "15 min",
    category: "Transformación",
  },
  {
    plan: "premium",
    planLabel: "Premium",
    title: "Coherencia cardíaca",
    description: "Sincroniza ritmo cardíaco y respiración para generar un estado de alta coherencia neurológica.",
    duration: "10 min",
    category: "Rendimiento",
  },
  {
    plan: "gold",
    planLabel: "Gold",
    title: "Integración del trauma",
    description: "Sesión profunda de regulación del sistema nervioso para liberar respuestas de estrés cronificadas.",
    duration: "25 min",
    category: "Trauma",
  },
]

const planColors: Record<string, string> = {
  free: "text-[#6b6b6b] border-[#6b6b6b]/30",
  premium: "text-[#00c8b4] border-[#00c8b4]/30",
  gold: "text-[#c8b89a] border-[#c8b89a]/30",
}

export default function MeditationsPreview() {
  return (
    <section id="meditaciones" className="bg-[#080808] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
          <div>
            <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
              Sala de Meditación
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight text-balance">
              Meditaciones para<br />cada nivel
            </h2>
          </div>
          <p className="text-[#6b6b6b] max-w-xs leading-relaxed font-sans text-sm">
            Desde 3 sesiones gratuitas hasta una biblioteca completa según tu plan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[#1e1e1e]">
          {previews.map((m, i) => (
            <div
              key={i}
              className="bg-[#080808] p-8 flex flex-col gap-4 group hover:bg-[#111111] transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs tracking-widest uppercase border px-2 py-0.5 font-sans ${planColors[m.plan]}`}>
                  {m.planLabel}
                </span>
                <span className="text-[#6b6b6b] text-xs font-sans">{m.duration}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#f0ede8] mb-2 leading-snug">{m.title}</h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed font-sans">{m.description}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-[#1e1e1e]">
                <span className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">{m.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/registro"
            className="inline-block px-10 py-4 border border-[#00c8b4] text-[#00c8b4] text-sm tracking-widest uppercase font-sans hover:bg-[#00c8b4] hover:text-[#080808] transition-all duration-300"
          >
            Acceder a la sala
          </Link>
        </div>
      </div>
    </section>
  )
}
