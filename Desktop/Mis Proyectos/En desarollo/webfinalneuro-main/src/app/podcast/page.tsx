'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { claimAndPlay, unregister } from '@/lib/audio-manager'
import { playAudioWithFadeIn, stopVoiceWithFadeOut, createAmbientPad, fetchElevenLabsTTS } from '@/lib/audio-utils'
import { trackSessionStart, trackSessionComplete, trackSessionInterrupted } from '@/lib/session-tracking'
import Container from '@/components/Container'
import FadeInSection from '@/components/FadeInSection'
import { Play, Pause, Headphones, Clock, Square } from 'lucide-react'

type AmbientRef = { ctx: AudioContext; gain: GainNode; oscs: OscillatorNode[]; stop: () => void } | null

type Episode = {
  id: number
  title: string
  description: string
  duration: string
  date: string
  category: string
  script: string
}

const episodes: Episode[] = [
  { id: 1, title: '¿Por qué tu cerebro prefiere el sufrimiento conocido?', description: 'El sesgo de negatividad y por qué tu mente elige lo malo conocido antes que lo bueno por conocer.', duration: '5:30', date: '2024-12-01', category: 'Neurociencia',
    script: 'NeuroPodcast. ¿Por qué tu cerebro prefiere el sufrimiento conocido? El sesgo de negatividad explica que tu mente elige lo malo conocido antes que lo bueno por conocer. La amígdala prioriza las amenazas. Lo desconocido se percibe como peligroso. Por eso cuesta tanto cambiar, aunque el cambio sea mejor. La neurociencia muestra que el cerebro pesa las pérdidas el doble que las ganancias. Conocer esto es el primer paso para no dejarte secuestrar por el miedo.' },
  { id: 2, title: 'La adicción al pensamiento', description: 'Piensas 60.000 pensamientos al día. El 95% son iguales que ayer. Estás enganchado y no lo sabes.', duration: '6:15', date: '2024-12-08', category: 'Consciencia',
    script: 'NeuroPodcast. La adicción al pensamiento. Piensas sesenta mil pensamientos al día. El noventa y cinco por ciento son iguales que ayer. Estás enganchado y no lo sabes. El cerebro repite patrones por eficiencia. Pero esa eficiencia te mantiene atrapado en bucles. La solución no es dejar de pensar. Es observar el pensamiento sin identificarte. Ese espacio es libertad.' },
  { id: 3, title: 'No eres tus pensamientos (y hay pruebas)', description: 'La neurociencia confirma lo que los místicos decían: hay un observador detrás del pensamiento.', duration: '7:00', date: '2024-12-15', category: 'Consciencia',
    script: 'NeuroPodcast. No eres tus pensamientos, y hay pruebas. La neurociencia confirma lo que los místicos decían: hay un observador detrás del pensamiento. Los estudios de neuroimagen muestran que puedes ver tus pensamientos como objetos. Eso requiere una instancia que observe. Ese observador no es un pensamiento más. Es consciencia pura. Conocer la diferencia cambia todo.' },
  { id: 4, title: '¿Meditar o medicar?', description: 'La meditación cambia la estructura cerebral en 8 semanas. La medicación la cambia en 2 horas. ¿Cuál es mejor?', duration: '5:45', date: '2024-12-22', category: 'Neurociencia',
    script: 'NeuroPodcast. ¿Meditar o medicar? La meditación cambia la estructura cerebral en ocho semanas. La medicación la cambia en dos horas. No es una competición. En crisis aguda, la medicación puede salvar. A largo plazo, la meditación fortalece circuitos sin efectos secundarios. Lo ideal: combinar cuando haga falta. La neuroplasticidad funciona con ambas. Elige con información, no con ideología.' },
  { id: 5, title: 'La trampa del "debería"', description: 'Tu corteza prefrontal te dice lo que deberías hacer. Tu amígdala te dice lo que sientes. ¿Quién manda?', duration: '4:50', date: '2025-01-05', category: 'Emociones',
    script: 'NeuroPodcast. La trampa del debería. Tu corteza prefrontal te dice lo que deberías hacer. Tu amígdala te dice lo que sientes. ¿Quién manda? El conflicto interno viene de ahí. No es que uno tenga razón y el otro no. Son dos sistemas con lenguajes distintos. La integración no es suprimir uno. Es escuchar ambos y elegir desde la consciencia.' },
  { id: 6, title: 'Dopamina: la molécula que te controla', description: 'Instagram, Netflix, azúcar. Tu cerebro busca dopamina como un adicto busca su dosis.', duration: '6:30', date: '2025-01-12', category: 'Neurociencia',
    script: 'NeuroPodcast. Dopamina: la molécula que te controla. Instagram, Netflix, azúcar. Tu cerebro busca dopamina como un adicto busca su dosis. No es malo. La dopamina mueve la motivación. El problema es la saturación. Demasiados estímulos altos vacían la sensibilidad. La solución: bajar la dosis, recuperar el gusto por lo simple. Menos es más, también en neuroquímica.' },
  { id: 7, title: '¿Por qué recordamos lo malo?', description: 'Tu cerebro es velcro para lo negativo y teflón para lo positivo. Se llama sesgo de negatividad.', duration: '5:10', date: '2025-01-19', category: 'Neurociencia',
    script: 'NeuroPodcast. ¿Por qué recordamos lo malo? Tu cerebro es velcro para lo negativo y teflón para lo positivo. Se llama sesgo de negatividad. Evolutivamente tenía sentido: recordar el peligro salvaba vidas. Hoy nos sabotea. Un solo comentario negativo borra diez elogios. Conocer el sesgo no lo elimina, pero permite no creerte todo lo que tu cerebro te cuenta.' },
  { id: 8, title: 'El piloto automático te roba la vida', description: 'Pasas el 47% del día sin estar presente. Eso son 33 años de vida en automático.', duration: '6:00', date: '2025-01-26', category: 'Presencia',
    script: 'NeuroPodcast. El piloto automático te roba la vida. Pasas el cuarenta y siete por ciento del día sin estar presente. Eso son treinta y tres años de vida en automático. La Red Neuronal por Defecto se activa cuando no haces nada. Rumia, preocupación, pasado, futuro. La presencia no es un lujo. Es recuperar tu vida minuto a minuto. Cada vez que notas que te fuiste y vuelves, ganas un instante.' },
  { id: 9, title: 'Tu cuerpo sabe lo que tu mente ignora', description: 'La interocepción: la capacidad olvidada de escuchar las señales de tu cuerpo.', duration: '5:20', date: '2025-02-02', category: 'Cuerpo',
    script: 'NeuroPodcast. Tu cuerpo sabe lo que tu mente ignora. La interocepción es la capacidad olvidada de escuchar las señales de tu cuerpo. La ínsula integra esas señales. Cuando la ignoras, el cuerpo grita más fuerte: tensión, enfermedad, colapso. Entrenar la interocepción es volver a casa. El cuerpo nunca miente. La mente sí.' },
  { id: 10, title: 'Morir antes de morir: el despertar que no necesita muerte', description: 'Las experiencias cercanas a la muerte cambian a la gente para siempre. Pero hay un atajo.', duration: '7:30', date: '2025-02-09', category: 'Despertar',
    script: 'NeuroPodcast. Morir antes de morir: el despertar que no necesita muerte. Las experiencias cercanas a la muerte cambian a la gente para siempre. Pero hay un atajo. La meditación profunda y la disolución del ego producen cambios similares sin riesgo. No hace falta un trauma. Hace falta valentía para soltar la identificación con el pensamiento. Ese soltar es el despertar.' },
]

const categories = ['Todos', 'Neurociencia', 'Consciencia', 'Emociones', 'Presencia', 'Cuerpo', 'Despertar']

export default function PodcastPage() {
  const [playing, setPlaying] = useState<number | null>(null)
  const [loadingEpisode, setLoadingEpisode] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [filter, setFilter] = useState('Todos')
  const genRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const playStartTimeRef = useRef<number>(0)
  const playingEpisodeRef = useRef<Episode | null>(null)
  const ttsAudioRef = useRef<{ audio: HTMLAudioElement; url?: string; voiceRefs?: import('@/lib/audio-utils').VoiceRefs } | null>(null)
  const ambientRef = useRef<AmbientRef>(null)

  const filtered = filter === 'Todos' ? episodes : episodes.filter(e => e.category === filter)

  const stopPodcast = useCallback(() => {
    window.speechSynthesis?.cancel()
    const ref = ttsAudioRef.current
    ttsAudioRef.current = null
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
    }
    setPlaying(null)
    setLoadingEpisode(null)
    setIsPaused(false)
    if (ref) {
      stopVoiceWithFadeOut(ref.audio, ref.voiceRefs ?? null, ref.url, () => {})
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') window.speechSynthesis?.getVoices()
    const loadVoices = () => window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices)
      unregister('podcast')
      stopPodcast()
    }
  }, [stopPodcast])

  const startTTS = useCallback((ep: Episode) => {
    if (!window.speechSynthesis || !ep.script) return
    const gen = ++genRef.current
    const lines = ep.script.split(/[.!?]\s+/).map(s => s.trim()).filter(Boolean)
    let i = 0
    const getVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      return voices.find(v => v.lang.startsWith('es') && (v.name.includes('Paulina') || v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('female')))
        || voices.find(v => v.lang.startsWith('es'))
    }
    const next = () => {
      if (genRef.current !== gen) return
      if (i >= lines.length) { stopPodcast(); return }
      const utt = new SpeechSynthesisUtterance(lines[i] + '.')
      utt.lang = 'es-ES'
      utt.rate = 0.78
      utt.pitch = 0.95
      utt.volume = 1
      const es = getVoice()
      if (es) utt.voice = es
      utt.onend = next
      window.speechSynthesis.speak(utt)
    }
    if (getVoice()) {
      next()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        if (genRef.current === gen) next()
      }
      setTimeout(() => {
        if (genRef.current === gen && !window.speechSynthesis.speaking) next()
      }, 500)
    }
  }, [stopPodcast])

  const handlePlay = useCallback(async (ep: Episode) => {
    if (typeof window === 'undefined') return
    stopPodcast()
    claimAndPlay('podcast', stopPodcast)
    window.speechSynthesis?.cancel()
    const thisGen = ++genRef.current
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    playingEpisodeRef.current = ep
    playStartTimeRef.current = Date.now()
    trackSessionStart('podcast', ep.title)
    setPlaying(ep.id)
    setLoadingEpisode(ep.id)
    setIsPaused(false)

    const CtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!CtxClass) {
      setLoadingEpisode(null)
      if (window.speechSynthesis) startTTS(ep)
      else stopPodcast()
      return
    }
    const ctx = new CtxClass()
    if (ctx.state === 'suspended') await ctx.resume()
    const pad = createAmbientPad(ctx, 0.2)
    ambientRef.current = { ...pad, ctx }

    try {
      const blob = await fetchElevenLabsTTS(ep.script, { signal })
      if (genRef.current !== thisGen || signal.aborted) return
      if (!blob) throw new Error('ElevenLabs fallback')
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => {
        trackSessionComplete('podcast', ep.title, Math.floor((Date.now() - playStartTimeRef.current) / 1000))
        stopPodcast()
      }
      audio.onerror = () => stopPodcast()
      setLoadingEpisode(null)
      if (genRef.current !== thisGen || signal.aborted) {
        URL.revokeObjectURL(url)
        return
      }
      const voiceRefs = await playAudioWithFadeIn(audio)
      if (genRef.current !== thisGen || signal.aborted) {
        URL.revokeObjectURL(url)
        try { voiceRefs.ctx.close() } catch {}
        return
      }
      ttsAudioRef.current = { audio, url, voiceRefs }
    } catch {
      if (genRef.current !== thisGen || signal.aborted) return
      setLoadingEpisode(null)
      if (window.speechSynthesis) startTTS(ep)
      else stopPodcast()
    }
  }, [stopPodcast, startTTS])

  const handleStop = useCallback(() => {
    stopPodcast()
  }, [stopPodcast])

  const handlePause = useCallback(() => {
    if (ttsAudioRef.current) ttsAudioRef.current.audio.pause()
    else window.speechSynthesis?.pause()
    if (ambientRef.current) ambientRef.current.gain.gain.setTargetAtTime(0, ambientRef.current.ctx.currentTime, 0.1)
    setIsPaused(true)
  }, [])

  const handleResume = useCallback(() => {
    if (ttsAudioRef.current) ttsAudioRef.current.audio.play().catch(() => {})
    else window.speechSynthesis?.resume()
    if (ambientRef.current) ambientRef.current.gain.gain.setTargetAtTime(0.2, ambientRef.current.ctx.currentTime, 0.1)
    setIsPaused(false)
  }, [])

  const handleEpisodeClick = (ep: Episode) => {
    if (loadingEpisode === ep.id) return
    const isActive = playing === ep.id
    if (isActive && !isPaused) handlePause()
    else if (isActive && isPaused) handleResume()
    else handlePlay(ep)
  }

  return (
    <div className="relative overflow-hidden">
      <div className="orb w-64 h-64 bg-accent-purple top-10 -left-20" />

      <section className="pt-8 md:pt-16 pb-4">
        <Container>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/15 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white animate-fade-in">NeuroPodcast</h1>
              <p className="text-text-secondary text-sm animate-fade-in-up">5 min de neurociencia que cambian tu día</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Filters */}
      <section className="pb-5">
        <Container>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  filter === c ? 'bg-accent-blue text-white' : 'bg-white/5 text-text-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Episodes */}
      <section className="pb-12">
        <Container>
          <div className="space-y-3">
            {filtered.map((ep) => {
              const isActive = playing === ep.id
              const isPausedEp = isActive && isPaused
              return (
                <FadeInSection key={ep.id}>
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleEpisodeClick(ep)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                          isActive ? 'bg-accent-blue text-white' : 'bg-accent-blue/15 text-accent-blue'
                        }`}
                      >
                        {!isActive ? <Play className="w-4 h-4 ml-0.5" /> : isPausedEp ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium mb-0.5">{ep.title}</p>
                        <p className="text-text-muted text-xs line-clamp-2 mb-2">{ep.description}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-text-muted" />
                            <span className="text-text-muted text-[10px]">{ep.duration}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-white/5 rounded text-text-muted text-[10px]">{ep.category}</span>
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-accent-blue text-[10px] font-medium">
                            {loadingEpisode === ep.id ? 'Preparando audio...' : isPausedEp ? 'En pausa' : 'Reproduciendo...'}
                          </span>
                          <button
                            onClick={handleStop}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-[10px] font-medium active:scale-95"
                          >
                            <Square className="w-3 h-3" /> Parar
                          </button>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-1 bg-accent-blue rounded-full ${isPausedEp ? 'w-1/3' : 'w-1/3 animate-pulse'}`} />
                        </div>
                      </div>
                    )}
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </Container>
      </section>
    </div>
  )
}
