import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { logout } from "@/app/actions/auth"

const ADMIN_EMAIL = "info@berzosaneuro.com"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect("/login")

  const [
    { data: contacts },
    { data: subscriptions },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("berzosa_contacts").select("*").order("created_at", { ascending: false }),
    supabase.from("berzosa_subscriptions").select("*, user_id").eq("status", "active"),
    supabase.from("berzosa_subscriptions").select("*", { count: "exact", head: true }),
  ])

  const premiumCount = subscriptions?.filter(s => s.plan === "premium").length || 0
  const goldCount = subscriptions?.filter(s => s.plan === "gold").length || 0
  const unreadContacts = contacts?.filter(c => !c.read).length || 0

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#080808] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-lg tracking-widest text-[#f0ede8] uppercase">
              Berzosa<span className="text-[#00c8b4]">Neuro</span>
            </Link>
            <span className="text-[#c8b89a] text-xs tracking-widest uppercase font-sans border border-[#c8b89a]/30 px-2 py-0.5">Admin</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans hover:text-[#f0ede8] transition-colors">
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <p className="text-[#6b6b6b] text-xs tracking-widest uppercase font-sans mb-2">Panel de control</p>
          <h1 className="font-serif text-3xl md:text-4xl text-[#f0ede8]">Administración</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e1e1e] mb-12">
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#00c8b4] mb-1">{totalUsers || 0}</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Suscripciones activas</p>
          </div>
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#00c8b4] mb-1">{premiumCount}</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Plan Premium</p>
          </div>
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#c8b89a] mb-1">{goldCount}</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Plan Gold</p>
          </div>
          <div className="bg-[#080808] p-6">
            <p className="font-serif text-3xl text-[#f0ede8] mb-1">{unreadContacts}</p>
            <p className="text-[#6b6b6b] text-xs tracking-wide font-sans">Mensajes sin leer</p>
          </div>
        </div>

        {/* Ingresos estimados */}
        <div className="border border-[#1e1e1e] p-6 mb-12">
          <h2 className="font-serif text-xl text-[#f0ede8] mb-4">Ingresos mensuales estimados</h2>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-4xl text-[#00c8b4]">
              {((premiumCount * 9.99) + (goldCount * 14.99)).toFixed(2)} €
            </span>
            <span className="text-[#6b6b6b] text-sm font-sans">/ mes</span>
          </div>
        </div>

        {/* Mensajes de contacto */}
        <div>
          <h2 className="font-serif text-2xl text-[#f0ede8] mb-6">
            Mensajes de contacto
            {unreadContacts > 0 && (
              <span className="ml-3 text-sm font-sans text-[#00c8b4] border border-[#00c8b4]/30 px-2 py-0.5">
                {unreadContacts} sin leer
              </span>
            )}
          </h2>

          {contacts && contacts.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#1e1e1e] border border-[#1e1e1e]">
              {contacts.map((c) => (
                <div key={c.id} className={`px-6 py-5 ${!c.read ? "bg-[#111111]" : ""}`}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="font-sans text-sm text-[#f0ede8] font-medium">{c.name}</span>
                      <span className="text-[#6b6b6b] text-xs font-sans ml-3">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {!c.read && (
                        <span className="text-[#00c8b4] text-xs tracking-widest uppercase font-sans">Nuevo</span>
                      )}
                      <span className="text-[#6b6b6b] text-xs font-sans">
                        {new Date(c.created_at).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#6b6b6b] text-sm font-sans leading-relaxed">{c.message}</p>
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-block mt-3 text-xs tracking-widest uppercase text-[#00c8b4] font-sans hover:text-[#f0ede8] transition-colors"
                  >
                    Responder →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#1e1e1e] p-8 text-center">
              <p className="text-[#6b6b6b] font-sans text-sm">No hay mensajes aún.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
