const steps = [
  {
    number: "N",
    title: "Nota el ruido",
    description:
      "El primer paso es detectar el ruido mental que te aleja del presente. Sin juzgar, sin resistir. Solo observar.",
  },
  {
    number: "E",
    title: "Entiende el patrón",
    description:
      "Tu mente repite ciclos automáticos. La neurociencia explica por qué ocurre y cómo salir de ellos.",
  },
  {
    number: "U",
    title: "Usa las herramientas",
    description:
      "Meditaciones guiadas, ejercicios de regulación y prácticas diarias respaldadas por la evidencia científica.",
  },
  {
    number: "R",
    title: "Reentrena tu cerebro",
    description:
      "La neuroplasticidad es real. Con práctica constante, creas nuevos caminos neuronales que sostienen el cambio.",
  },
  {
    number: "O",
    title: "Opera desde la presencia",
    description:
      "El resultado no es la calma perfecta. Es la capacidad de actuar con claridad aunque el mundo no se detenga.",
  },
]

export default function Method() {
  return (
    <section id="metodo" className="bg-[#111111] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
          <div>
            <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
              El Método
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight text-balance">
              El método <span className="text-[#00c8b4]">NEURO</span>
            </h2>
          </div>
          <p className="text-[#6b6b6b] max-w-xs leading-relaxed font-sans text-sm">
            Cinco pasos para salir del ruido mental y recuperar el control de tu atención.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-px bg-[#1e1e1e]">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-[#111111] p-8 flex flex-col gap-4 group hover:bg-[#080808] transition-colors duration-300"
            >
              <span className="font-serif text-5xl text-[#00c8b4]/20 group-hover:text-[#00c8b4]/40 transition-colors duration-500 leading-none select-none">
                {step.number}
              </span>
              <h3 className="font-serif text-lg text-[#f0ede8] leading-snug">{step.title}</h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed font-sans">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
