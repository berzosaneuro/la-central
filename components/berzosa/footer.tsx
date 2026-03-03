export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#1e1e1e] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-serif text-lg tracking-widest uppercase text-[#f0ede8]">
          Berzosa<span className="text-[#00c8b4]">Neuro</span>
        </span>
        <p className="text-[#6b6b6b] text-xs tracking-wide font-sans text-center">
          &copy; {new Date().getFullYear()} BerzosaNeuro — Todos los derechos reservados
        </p>
        <div className="flex gap-6">
          <a
            href="https://instagram.com/berzosaneuro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b6b6b] text-xs tracking-widest uppercase hover:text-[#00c8b4] transition-colors font-sans"
          >
            Instagram
          </a>
          <a
            href="mailto:info@berzosaneuro.com"
            className="text-[#6b6b6b] text-xs tracking-widest uppercase hover:text-[#00c8b4] transition-colors font-sans"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
