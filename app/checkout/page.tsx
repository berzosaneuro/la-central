"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createCheckoutSession } from "@/app/actions/stripe"
import { PLANS } from "@/lib/products"
import { Check } from "lucide-react"
import { Suspense } from "react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") || "premium"
  const plan = PLANS.find(p => p.id === planId) || PLANS[1]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCheckout() {
    setLoading(true)
    setError("")
    try {
      const { url } = await createCheckoutSession(plan.id)
      if (url) router.push(url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar el pago"
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <Link href="/" className="font-serif text-2xl tracking-widest text-[#f0ede8] uppercase">
            Berzosa<span className="text-[#00c8b4]">Neuro</span>
          </Link>
        </div>

        <div className="border border-[#1e1e1e] p-10">
          <p className="text-[#00c8b4] text-xs tracking-widest uppercase font-sans mb-2">Plan seleccionado</p>
          <h1 className="font-serif text-3xl text-[#f0ede8] mb-1">{plan.name}</h1>
          <p className="text-[#6b6b6b] text-sm font-sans mb-6">{plan.description}</p>

          <div className="border-t border-[#1e1e1e] pt-6 mb-6">
            <ul className="space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm font-sans text-[#6b6b6b]">
                  <Check size={14} className="text-[#00c8b4] mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-baseline gap-2 mb-8 border-t border-[#1e1e1e] pt-6">
            <span className="font-serif text-4xl text-[#f0ede8]">{plan.priceLabel}</span>
          </div>

          {error && <p className="text-red-400 text-xs font-sans mb-4">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#00c8b4] text-[#080808] py-4 text-sm tracking-widest uppercase font-sans font-medium hover:bg-[#f0ede8] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirigiendo..." : "Continuar al pago"}
          </button>

          <p className="text-center text-[#6b6b6b] text-xs font-sans mt-4">
            Pago seguro con Stripe. Cancela cuando quieras.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans hover:text-[#f0ede8] transition-colors">
            ← Volver al panel
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center"><span className="text-[#6b6b6b] font-sans text-sm">Cargando...</span></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
