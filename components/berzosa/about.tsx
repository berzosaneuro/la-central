import Image from "next/image";

const stats = [
  { value: "+10", label: "Años de experiencia" },
  { value: "+500", label: "Personas acompañadas" },
  { value: "3", label: "Áreas de especialidad" },
];

export default function About() {
  return (
    <section id="sobre-mi" className="bg-[#080808] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/images/foto2web.jpg"
                alt="BerzosaNeuro — retrato"
                fill
                className="object-cover object-top"
              />
              {/* subtle border overlay */}
              <div className="absolute inset-0 border border-[#1e1e1e]" />
            </div>
            {/* accent corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-[#00c8b4]" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-[#00c8b4]" />
          </div>

          {/* Content */}
          <div>
            <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
              Sobre mí
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-8 text-balance">
              Una visión distinta de la mente humana
            </h2>
            <div className="space-y-5 text-[#6b6b6b] leading-relaxed font-sans">
              <p>
                Soy especialista en neurociencia aplicada, con formación en neurobiología del comportamiento y más de una década acompañando a personas en procesos de cambio real y sostenido.
              </p>
              <p>
                Mi trabajo no sigue los caminos convencionales. Combino el rigor científico con una comprensión profunda de cómo funciona la mente cuando está bajo presión, en conflicto o buscando evolucionar.
              </p>
              <p>
                Creo que entender tu cerebro es el primer paso para dejar de ser su prisionero.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-[#1e1e1e]">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl text-[#00c8b4] mb-1">{stat.value}</p>
                  <p className="text-[#6b6b6b] text-xs tracking-wide leading-snug font-sans">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
