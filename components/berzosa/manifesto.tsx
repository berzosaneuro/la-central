export default function Manifesto() {
  return (
    <section className="bg-[#080808] py-28 md:py-36 border-y border-[#1e1e1e]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <span className="inline-block w-12 h-px bg-[#00c8b4] mb-10" />
        <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#f0ede8] leading-tight text-balance mb-10">
          "El cerebro no es tu enemigo.{" "}
          <span className="text-[#6b6b6b]">
            Es el territorio que todavía no has aprendido a habitar."
          </span>
        </blockquote>
        <span className="inline-block w-12 h-px bg-[#00c8b4]" />
      </div>
    </section>
  );
}
