"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "El Método", href: "#metodo" },
  { label: "Meditaciones", href: "#meditaciones" },
  { label: "Curso 7 Días", href: "#curso" },
  { label: "Planes", href: "#precios" },
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#080808]/90 backdrop-blur-md border-b border-[#1e1e1e]" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="#inicio" className="font-serif text-xl tracking-widest text-[#f0ede8] uppercase">
          Berzosa<span className="text-[#00c8b4]">Neuro</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs tracking-widest uppercase text-[#6b6b6b] hover:text-[#f0ede8] transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs tracking-widest uppercase text-[#6b6b6b] hover:text-[#f0ede8] transition-colors duration-300"
          >
            Acceder
          </Link>
          <Link
            href="/registro"
            className="text-xs tracking-widest uppercase border border-[#00c8b4] text-[#00c8b4] px-5 py-2 hover:bg-[#00c8b4] hover:text-[#080808] transition-all duration-300"
          >
            Comenzar
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span className={`block w-6 h-0.5 bg-[#f0ede8] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#f0ede8] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#f0ede8] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#080808] border-t border-[#1e1e1e] px-6 py-8 flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-widest uppercase text-[#6b6b6b] hover:text-[#f0ede8] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-[#1e1e1e]">
            <Link href="/login" className="text-sm tracking-widest uppercase text-[#6b6b6b] hover:text-[#f0ede8] transition-colors">Acceder</Link>
            <Link
              href="/registro"
              className="text-sm tracking-widest uppercase border border-[#00c8b4] text-[#00c8b4] px-5 py-3 text-center hover:bg-[#00c8b4] hover:text-[#080808] transition-all duration-300"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
