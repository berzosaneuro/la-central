"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    setTimeout(() => {
      el.style.width = "100%";
    }, 400);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]"
    >
      {/* Background image — right side, fading left */}
      <div className="absolute inset-0 flex justify-end pointer-events-none">
        <div className="relative w-full md:w-1/2 h-full">
          <Image
            src="/images/foto1web.jpg"
            alt="Foto de perfil de BerzosaNeuro"
            fill
            className="object-cover object-top"
            priority
          />
          {/* fade left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/60 to-transparent" />
          {/* fade bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="max-w-xl">
          <p className="text-[#00c8b4] text-xs tracking-[0.3em] uppercase mb-6 font-sans">
            Neurociencia Aplicada
          </p>

          <h1 className="font-serif text-5xl md:text-7xl text-[#f0ede8] leading-tight mb-6 text-balance">
            Donde la<br />
            <span className="text-[#00c8b4]">ciencia</span><br />
            te libera
          </h1>

          {/* animated line */}
          <div className="overflow-hidden mb-8">
            <div
              ref={lineRef}
              style={{ width: "0%", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }}
              className="h-px bg-[#00c8b4]"
            />
          </div>

          <p className="text-[#6b6b6b] text-lg leading-relaxed mb-10 max-w-md font-sans">
            Especialista en neurociencia aplicada al bienestar, el rendimiento y la transformación personal. Un enfoque riguroso, diferente y profundamente humano.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="px-8 py-4 bg-[#00c8b4] text-[#080808] text-sm tracking-widest uppercase font-sans font-medium hover:bg-[#f0ede8] transition-colors duration-300"
            >
              Contactar
            </a>
            <a
              href="#sobre-mi"
              className="px-8 py-4 border border-[#1e1e1e] text-[#6b6b6b] text-sm tracking-widest uppercase font-sans hover:border-[#f0ede8] hover:text-[#f0ede8] transition-colors duration-300"
            >
              Conocerme
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[#6b6b6b] text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#00c8b4] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
