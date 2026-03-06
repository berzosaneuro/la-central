"use client";

import { useState } from "react";
import { sendContact } from "@/app/actions/auth";

export default function Contact() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData();
    data.append("name", form.nombre);
    data.append("email", form.email);
    data.append("message", form.mensaje);
    const result = await sendContact(data);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    setSent(true);
    setForm({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <section id="contacto" className="bg-[#080808] py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-4 font-sans">
              Contacto
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#f0ede8] leading-tight mb-8 text-balance">
              Hablemos sobre tu proceso
            </h2>
            <p className="text-[#6b6b6b] leading-relaxed font-sans mb-12">
              Si sientes que es momento de entender mejor cómo funciona tu mente y qué está bloqueando tu desarrollo, escríbeme. Respondo personalmente a cada mensaje.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[#00c8b4]/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#00c8b4" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#6b6b6b] text-xs tracking-widest uppercase mb-1 font-sans">Email</p>
                  <a href="mailto:info@berzosaneuro.com" className="text-[#f0ede8] hover:text-[#00c8b4] transition-colors font-sans">
                    info@berzosaneuro.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[#00c8b4]/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#00c8b4" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#6b6b6b] text-xs tracking-widest uppercase mb-1 font-sans">Instagram</p>
                  <a href="https://instagram.com/berzosaneuro" target="_blank" rel="noopener noreferrer" className="text-[#f0ede8] hover:text-[#00c8b4] transition-colors font-sans">
                    @berzosaneuro
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="border border-[#1e1e1e] p-8 md:p-10">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="w-12 h-12 border border-[#00c8b4] flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#00c8b4" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-[#f0ede8]">Mensaje enviado</h3>
                <p className="text-[#6b6b6b] font-sans text-sm">Te responderé en menos de 48 horas.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-[#00c8b4] text-xs tracking-widest uppercase hover:text-[#f0ede8] transition-colors font-sans"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">Nombre</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="bg-transparent border border-[#1e1e1e] text-[#f0ede8] px-4 py-3 font-sans text-sm outline-none focus:border-[#00c8b4] transition-colors placeholder:text-[#6b6b6b]/40"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-transparent border border-[#1e1e1e] text-[#f0ede8] px-4 py-3 font-sans text-sm outline-none focus:border-[#00c8b4] transition-colors placeholder:text-[#6b6b6b]/40"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans">Mensaje</label>
                  <textarea
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    className="bg-transparent border border-[#1e1e1e] text-[#f0ede8] px-4 py-3 font-sans text-sm outline-none focus:border-[#00c8b4] transition-colors resize-none placeholder:text-[#6b6b6b]/40"
                    placeholder="Cuéntame brevemente qué te trae aquí..."
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-xs font-sans">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00c8b4] text-[#080808] py-4 text-sm tracking-widest uppercase font-sans font-medium hover:bg-[#f0ede8] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
