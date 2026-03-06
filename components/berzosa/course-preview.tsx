import Link from "next/link"

const days = [
  { day: 1, title: "El ruido que no escuchas", desc: "Identifica los patrones automáticos que dirigen tu vida sin que lo sepas." },
  { day: 2, title: "Tu sistema nervioso manda", desc: "Cómo el estrés crónico recablea tu cerebro y qué hacer para revertirlo." },
  { day: 3, title: "La trampa de los pensamientos", desc: "Por qué tu mente genera 60.000 pensamientos al día y casi ninguno es útil." },
  { day: 4, title: "Neuroplasticidad en acción", desc: "Crea nuevos caminos neuronales con prácticas de 10 minutos al día." },
  { day: 5, title: "Regulación emocional real", desc: "No se trata de no sentir. Se trata de no ser gobernado por lo que sientes." },
  { day: 6, title: "El foco como músculo", desc: "Entrena la atención selectiva y recupera la capacidad de concentración profunda." },
  { day: 7, title: "Presencia sostenida", desc: "Integra todo lo aprendido y diseña tu práctica personal para los próximos 30 días." },
]

export default function CoursePreview() {
  return (
    <section id="curso" className="bg-[#111111] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: info */}
          <div className="md:sticky md:top-24">
            <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
              Curso Intensivo
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-6 text-balance">
              7 días para<br />resetear tu mente
            </h2>
            <p className="text-[#6b6b6b] leading-relaxed font-sans mb-8">
              Un programa diario de 7 días con lecciones en audio, meditaciones guiadas y ejercicios prácticos. Diseñado para crear hábitos neuronales que duren.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "7 lecciones en audio (15-20 min)",
                "7 meditaciones guiadas exclusivas",
                "Guía de práctica diaria en PDF",
                "Acceso ilimitado una vez comprado",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-sans text-[#6b6b6b]">
                  <span className="text-[#00c8b4] mt-0.5 flex-shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              <span className="font-serif text-4xl text-[#f0ede8]">47 €</span>
              <span className="text-[#6b6b6b] text-sm font-sans">pago único</span>
            </div>
            <div className="mt-6">
              <Link
                href="/registro"
                className="inline-block px-10 py-4 bg-[#00c8b4] text-[#080808] text-sm tracking-widest uppercase font-sans font-medium hover:bg-[#f0ede8] transition-colors duration-300"
              >
                Acceder al Curso
              </Link>
              <p className="text-[#6b6b6b] text-xs font-sans mt-3">Incluido en planes Premium y Gold</p>
            </div>
          </div>

          {/* Right: days */}
          <div className="flex flex-col divide-y divide-[#1e1e1e]">
            {days.map((d) => (
              <div key={d.day} className="py-6 flex items-start gap-6 group">
                <span className="font-serif text-3xl text-[#1e1e1e] group-hover:text-[#00c8b4]/30 transition-colors duration-500 w-8 flex-shrink-0 leading-none">
                  {d.day}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-[#f0ede8] mb-1">{d.title}</h3>
                  <p className="text-[#6b6b6b] text-sm leading-relaxed font-sans">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
