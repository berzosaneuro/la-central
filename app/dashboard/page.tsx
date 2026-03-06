import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { logout } from "@/app/actions/auth"
import { PLANS } from "@/lib/products"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: sub } = await supabase
    .from("berzosa_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  const { data: meditations } = await supabase
    .from("berzosa_meditations")
    .select("*")
    .eq("active", true)
    .order("sort_order")

  const { data: sessions } = await supabase
    .from("berzosa_sessions")
    .select("*")
    .eq("user_id", user.id)

  const { data: progress } = await supabase
    .from("berzosa_course_progress")
    .select("*")
    .eq("user_id", user.id)

  const currentPlan = sub?.plan || "free"
  const planInfo = PLANS.find(p => p.id === currentPlan)
  const totalSessions = sessions?.length || 0
  const courseDaysCompleted = progress?.filter(p => p.completed).length || 0

  const planOrder: Record<string, number> = { free: 0, premium: 1, gold: 2 }

  const canAccess = (required: string) =>
    (planOrder[currentPlan] || 0) >= (planOrder[required] || 0)

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#080808] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg tracking-widest text-[#f0ede8] uppercase">
            Berzosa<span className="text-[#00c8b4]">Neuro</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-[#6b6b6b] text-xs font-sans uppercase tracking-widest border border-[#1e1e1e] px-3 py-1">
              {planInfo?.name || "Free"}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans hover:text-[#f0ede8] transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <p className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans mb-2">Bienvenido</p>
          <h1 className="font-serif text-3xl md:text-4xl text-[#f0ede8]">
            {user.user_metadata?.full_name || user.email?.split("@")[0]}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-[#1e1e1e] mb-12">
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#00c8b4] mb-1">{totalSessions}</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Sesiones completadas</p>
          </div>
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#00c8b4] mb-1">{courseDaysCompleted}/7</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Días del curso</p>
          </div>
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#00c8b4] mb-1">{planInfo?.meditationsIncluded === 999 ? "∞" : planInfo?.meditationsIncluded}</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Meditaciones disponibles</p>
          </div>
        </div>

        {/* Upgrade banner if free */}
        {currentPlan === "free" && (
          <div className="border border-[#00c8b4]/30 bg-[#00c8b4]/5 p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-[#f0ede8] font-serif text-lg mb-1">Desbloquea más contenido</p>
              <p className="text-[#6b6b6b] text-sm font-sans">Pasa a Premium desde 9,99 €/mes y accede a 10 meditaciones + el curso de 7 días.</p>
            </div>
            <Link
              href="/checkout?plan=premium"
              className="flex-shrink-0 px-8 py-3 bg-[#00c8b4] text-[#080808] text-xs tracking-widest uppercase font-sans font-medium hover:bg-[#f0ede8] transition-colors duration-300"
            >
              Mejorar plan
            </Link>
          </div>
        )}

        {/* Meditations */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-[#f0ede8] mb-6">Sala de meditación</h2>
          <div className="grid md:grid-cols-3 gap-px bg-[#1e1e1e]">
            {meditations?.slice(0, planInfo?.meditationsIncluded === 999 ? meditations.length : planInfo?.meditationsIncluded || 3).map((m) => {
              const accessible = canAccess(m.plan_required)
              return (
                <div
                  key={m.id}
                  className={`p-6 flex flex-col gap-3 ${accessible ? "bg-[#080808] hover:bg-[#111111]" : "bg-[#080808] opacity-40"} transition-colors duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#00c8b4] text-xs tracking-widest uppercase border border-[#00c8b4]/30 px-2 py-0.5 font-sans">
                      {m.duration_minutes} min
                    </span>
                    {!accessible && (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6b6b6b" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-serif text-base text-[#f0ede8]">{m.title}</h3>
                  <p className="text-[#6b6b6b] text-xs font-sans leading-relaxed">{m.description}</p>
                  {accessible ? (
                    <button className="mt-auto text-left text-xs tracking-widest uppercase text-[#00c8b4] font-sans hover:text-[#f0ede8] transition-colors pt-2">
                      Iniciar →
                    </button>
                  ) : (
                    <Link href="/checkout?plan=premium" className="mt-auto text-left text-xs tracking-widest uppercase text-[#6b6b6b] font-sans hover:text-[#00c8b4] transition-colors pt-2">
                      Desbloquear →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Curso 7 días */}
        <div>
          <h2 className="font-serif text-2xl text-[#f0ede8] mb-6">Curso de 7 días</h2>
          {canAccess("premium") ? (
            <div className="flex flex-col divide-y divide-[#1e1e1e] border border-[#1e1e1e]">
              {[1,2,3,4,5,6,7].map((day) => {
                const done = progress?.find(p => p.day_number === day && p.completed)
                return (
                  <div key={day} className="flex items-center gap-6 px-6 py-4 hover:bg-[#111111] transition-colors">
                    <div className={`w-6 h-6 border flex items-center justify-center flex-shrink-0 ${done ? "border-[#00c8b4] bg-[#00c8b4]/10" : "border-[#1e1e1e]"}`}>
                      {done && (
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#00c8b4" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-sans text-sm text-[#6b6b6b]">Día {day}</span>
                    <span className={`font-sans text-sm ${done ? "text-[#6b6b6b] line-through" : "text-[#f0ede8]"}`}>
                      {["El ruido que no escuchas","Tu sistema nervioso manda","La trampa de los pensamientos","Neuroplasticidad en acción","Regulación emocional real","El foco como músculo","Presencia sostenida"][day-1]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border border-[#1e1e1e] p-8 text-center">
              <p className="text-[#6b6b6b] font-sans text-sm mb-4">El curso de 7 días está disponible en el plan Premium y Gold.</p>
              <Link
                href="/checkout?plan=premium"
                className="inline-block px-8 py-3 border border-[#00c8b4] text-[#00c8b4] text-xs tracking-widest uppercase font-sans hover:bg-[#00c8b4] hover:text-[#080808] transition-all duration-300"
              >
                Desbloquear curso
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
