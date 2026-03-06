import Link from "next/link"
import { PLANS } from "@/lib/products"
import { Check } from "lucide-react"

export default function Pricing() {
  return (
    <section id="precios" className="bg-[#080808] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
            Planes
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight text-balance">
            Elige tu nivel de práctica
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[#1e1e1e]">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col p-10 relative ${
                plan.popular
                  ? "bg-[#111111]"
                  : "bg-[#080808]"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-px bg-[#00c8b4]" />
              )}
              <div className="mb-8">
                {plan.popular && (
                  <span className="text-[#00c8b4] text-xs tracking-widest uppercase font-sans block mb-3">
                    Más popular
                  </span>
                )}
                <h3 className="font-serif text-2xl text-[#f0ede8] mb-2">{plan.name}</h3>
                <p className="text-[#6b6b6b] text-sm font-sans leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="font-serif text-4xl text-[#f0ede8]">{plan.priceLabel}</span>
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-sans text-[#6b6b6b]">
                    <Check size={14} className="text-[#00c8b4] mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.priceInCents === 0 ? "/registro" : `/checkout?plan=${plan.id}`}
                className={`text-center text-sm tracking-widest uppercase font-sans py-4 transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#00c8b4] text-[#080808] hover:bg-[#f0ede8]"
                    : "border border-[#1e1e1e] text-[#6b6b6b] hover:border-[#f0ede8] hover:text-[#f0ede8]"
                }`}
              >
                {plan.priceInCents === 0 ? "Empezar Gratis" : `Suscribirse — ${plan.priceLabel}`}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[#6b6b6b] text-xs font-sans mt-8 tracking-wide">
          Cancela cuando quieras. Sin permanencia. Sin letra pequeña.
        </p>
      </div>
    </section>
  )
}
