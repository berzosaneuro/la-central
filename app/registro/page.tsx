"use client"

import { useState } from "react"
import Link from "next/link"
import { signup } from "@/app/actions/auth"

export default function RegistroPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signup(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="font-serif text-2xl tracking-widest text-[#f0ede8] uppercase block mb-12">
            Berzosa<span className="text-[#00c8b4]">Neuro</span>
          </Link>
          <div className="border border-[#1e1e1e] p-10">
            <div className="w-12 h-12 border border-[#00c8b4] flex items-center justify-center mx-auto mb-6">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#00c8b4" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-[#f0ede8] mb-3">Revisa tu email</h2>
            <p className="text-[#6b6b6b] font-sans text-sm leading-relaxed">
              Te hemos enviado un enlace de confirmación. Haz clic en él para activar tu cuenta y comenzar tu práctica.
            </p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="font-serif text-3xl text-[#f0ede8] mb-2">Crear cuenta</h1>
          <p className="text-[#6b6b6b] text-sm font-sans mb-8">Empieza gratis, sin tarjeta</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">Nombre</label>
              <input
                type="text"
                name="name"
                required
                className="bg-transparent border border-[#1e1e1e] text-[#f0ede8] px-4 py-3 font-sans text-sm outline-none focus:border-[#00c8b4] transition-colors placeholder:text-[#6b6b6b]/40"
                placeholder="Tu nombre"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">Email</label>
              <input
                type="email"
                name="email"
                required
                className="bg-transparent border border-[#1e1e1e] text-[#f0ede8] px-4 py-3 font-sans text-sm outline-none focus:border-[#00c8b4] transition-colors placeholder:text-[#6b6b6b]/40"
                placeholder="tu@email.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="bg-transparent border border-[#1e1e1e] text-[#f0ede8] px-4 py-3 font-sans text-sm outline-none focus:border-[#00c8b4] transition-colors placeholder:text-[#6b6b6b]/40"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-sans">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00c8b4] text-[#080808] py-4 text-sm tracking-widest uppercase font-sans font-medium hover:bg-[#f0ede8] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>

          <p className="text-center text-[#6b6b6b] text-xs font-sans mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#00c8b4] hover:text-[#f0ede8] transition-colors">
              Acceder
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans hover:text-[#f0ede8] transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
