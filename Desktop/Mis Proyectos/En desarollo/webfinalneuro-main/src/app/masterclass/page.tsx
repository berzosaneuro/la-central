'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { claimAndPlay, unregister } from '@/lib/audio-manager'
import { stopVoiceWithFadeOut, createAmbientPad } from '@/lib/audio-utils'
import { trackSessionInterrupted } from '@/lib/session-tracking'
import Container from '@/components/Container'
import FadeInSection from '@/components/FadeInSection'
import PremiumLock from '@/components/PremiumLock'
import { Play, Pause, Square, Clock, Brain, Eye, Zap, Heart, Shield, Flame, X } from 'lucide-react'

type MasterClass = {
  id: string
  title: string
  subtitle: string
  duration: string
  icon: React.ElementType
  color: string
  topics: string[]
  free: boolean
  script: string
}

const masterclasses: MasterClass[] = [
  {
    id: 'ego',
    title: 'La neurociencia del ego',
    subtitle: 'Por qué tu cerebro construye una identidad falsa',
    duration: '18 min',
    icon: Brain,
    color: 'bg-violet-500/15 text-violet-400',
    topics: ['Red Neuronal por Defecto (DMN)', 'Cómo el ego es un constructo neurológico', 'Ejercicio: desidentificación en 3 pasos'],
    free: true,
    script: 'La neurociencia del ego. Por qué tu cerebro construye una identidad falsa. La Red Neuronal por Defecto, o DMN, es la responsable de la historia que cuentas sobre ti. El ego es un constructo neurológico: no es una entidad fija, es un proceso. La corteza prefrontal medial genera la narrativa del yo. Aprende el ejercicio de desidentificación en tres pasos: observar el pensamiento, nombrarlo sin seguirlo y volver al cuerpo.',
  },
  {
    id: 'amigdala',
    title: 'Cómo tu amígdala te secuestra',
    subtitle: 'El mecanismo del miedo y cómo desactivarlo',
    duration: '15 min',
    icon: Shield,
    color: 'bg-rose-500/15 text-rose-400',
    topics: ['Amygdala hijack: qué es y por qué ocurre', 'La ventana de 6 segundos', 'Técnica de regulación prefrontal'],
    free: true,
    script: 'Cómo tu amígdala te secuestra. El mecanismo del miedo y cómo desactivarlo. El amygdala hijack ocurre cuando la amígdala toma el control antes de que la corteza prefrontal pueda evaluar. Evolutivamente nos salvó. Hoy nos sabotea. Existe una ventana de seis segundos: el cortisol tarda ese tiempo en inundar el cuerpo. Usa la técnica de regulación prefrontal: pausa, respira profundo, nombra la emoción. Eso activa la corteza y desactiva el secuestro.',
  },
  {
    id: 'dmn',
    title: 'DMN: La red que te mantiene dormido',
    subtitle: 'Tu mente tiene un modo por defecto que te atrapa',
    duration: '22 min',
    icon: Eye,
    color: 'bg-cyan-500/15 text-cyan-400',
    topics: ['Qué es la DMN y por qué importa', 'Rumiación vs. creatividad', 'Cómo la meditación apaga la DMN'],
    free: false,
    script: 'DMN: La red que te mantiene dormido. Tu mente tiene un modo por defecto que te atrapa. La Red Neuronal por Defecto se activa cuando no haces nada focalizado. Ahí aparece la rumiación, el pasado, el futuro, las preocupaciones. Rumiación y creatividad usan redes distintas: la primera te atrapa, la segunda te libera. La meditación de atención plena reduce la actividad de la DMN. Con la práctica, el modo por defecto deja de ser tu dueño.',
  },
  {
    id: 'neuroplasticidad',
    title: 'Neuroplasticidad: recablea tu cerebro',
    subtitle: 'Tu cerebro cambia. Literalmente. Úsalo a tu favor.',
    duration: '20 min',
    icon: Zap,
    color: 'bg-emerald-500/15 text-emerald-400',
    topics: ['Hebbian learning: neuronas que disparan juntas', '8 semanas para cambiar estructura cerebral', 'Protocolo de cambio de hábitos'],
    free: false,
    script: 'Neuroplasticidad: recablea tu cerebro. Tu cerebro cambia, literalmente. Hebbian learning: las neuronas que disparan juntas se conectan juntas. En ocho semanas de práctica consistente hay cambios estructurales medibles en el cerebro. El protocolo de cambio de hábitos: identifica el disparador, practica la nueva respuesta, repite. La neuroplasticidad no distingue entre buenos y malos hábitos. Elige qué cablear.',
  },
  {
    id: 'observador',
    title: 'El observador: quién eres realmente',
    subtitle: 'Más allá del pensamiento, más allá de la emoción',
    duration: '25 min',
    icon: Eye,
    color: 'bg-teal-500/15 text-teal-400',
    topics: ['Consciencia testigo vs. ego narrativo', 'Experimento del espejo interior', 'La paradoja de observar al observador'],
    free: false,
    script: 'El observador: quién eres realmente. Más allá del pensamiento, más allá de la emoción. La consciencia testigo es distinta del ego narrativo. El ego cuenta una historia. El testigo solo presencia. En el experimento del espejo interior te sientas a observar tus pensamientos como objetos que pasan. No los sigues. Los ves. La paradoja: no puedes observar al observador sin convertirlo en objeto. Ese espacio inobservable es lo que eres.',
  },
  {
    id: 'emociones',
    title: 'Emociones: la guía que ignoras',
    subtitle: 'No las reprimas. No las sigas. Entiéndelas.',
    duration: '17 min',
    icon: Heart,
    color: 'bg-pink-500/15 text-pink-400',
    topics: ['Mapa neural de las emociones', 'Interocepción: escuchar al cuerpo', 'Regulación emocional basada en evidencia'],
    free: false,
    script: 'Emociones: la guía que ignoras. No las reprimas, no las sigas, entiéndelas. El mapa neural de las emociones muestra que cada emoción tiene coordenadas cerebrales y corporales. La interocepción es la capacidad de escuchar las señales del cuerpo. La ínsula las integra. La regulación emocional basada en evidencia: nombrar reduce la amígdala, la respiración larga activa el parasimpático, el cuerpo informa antes que la mente.',
  },
  {
    id: 'cortisol',
    title: 'El cortisol y tú: vivir en modo lucha',
    subtitle: 'Por qué estás estresado incluso cuando no pasa nada',
    duration: '16 min',
    icon: Flame,
    color: 'bg-orange-500/15 text-orange-400',
    topics: ['Eje HPA y estrés crónico', 'Cómo la respiración regula cortisol', 'Protocolo anti-cortisol de 5 min'],
    free: false,
    script: 'El cortisol y tú: vivir en modo lucha. Por qué estás estresado incluso cuando no pasa nada. El eje HPA, hipotálamo-hipófisis-suprarrenal, se activa ante amenazas. El estrés crónico mantiene el cortisol elevado. La respiración lenta y profunda activa el nervio vago y reduce cortisol. Protocolo anti-cortisol de cinco minutos: inhala cuatro segundos, exhala ocho. Tres veces. Tu cuerpo no distingue entre amenaza real y pensada. Cambia la respuesta.',
  },
]

function MasterClassCard({ mc, onSelect }: { mc: MasterClass; onSelect: () => void }) {
  return (
    <div className="glass rounded-2xl p-5 card-hover">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl ${mc.color} flex items-center justify-center shrink-0`}>
          <mc.icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-white text-sm">{mc.title}</h3>
          <p className="text-text-muted text-xs mt-0.5">{mc.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-text-muted text-xs">{mc.duration}</span>
      </div>

      <ul className="space-y-1.5 mb-4">
        {mc.topics.map((t, i) => (
          <li key={i} className="text-text-secondary text-xs flex items-start gap-2">
            <span className="text-accent-blue mt-0.5">·</span> {t}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className="w-full py-2.5 rounded-xl bg-white/5 text-white text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-white/10"
      >
        <Play className="w-3.5 h-3.5" /> Escuchar masterclass
      </button>
    </div>
  )
}

type AmbientRef = { ctx: AudioContext; gain: GainNode; oscs: OscillatorNode[]; stop: () => void } | null

export default function MasterclassPage() {
  const [selected, setSelected] = useState<MasterClass | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loadingMasterclass, setLoadingMasterclass] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const genRef = useRef(0)
  const ttsAudioRef = useRef<{ audio: HTMLAudioElement; url?: string; voiceRefs?: import('@/lib/audio-utils').VoiceRefs } | null>(null)
  const ambientRef = useRef<AmbientRef>(null)

  const playingMcRef = useRef<MasterClass | null>(null)
  const playStartTimeRef = useRef<number>(0)

  const stopMasterclass = useCallback(() => {
    window.speechSynthesis?.cancel()
    const ref = ttsAudioRef.current
    ttsAudioRef.current = null
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
    }
    const mc = playingMcRef.current
    if (mc && playStartTimeRef.current > 0) {
      trackSessionInterrupted('masterclass', mc.title, Math.floor((Date.now() - playStartTimeRef.current) / 1000))
    }
    playingMcRef.current = null
    playStartTimeRef.current = 0
    setPlaying(false)
    setLoadingMasterclass(null)
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
      unregister('masterclass')
      stopMasterclass()
    }
  }, [stopMasterclass])

  const handlePlay = useCallback((mc: MasterClass) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const gen = ++genRef.current
    const lines = mc.script.split(/[.!?]\s+/).map(s => s.trim()).filter(Boolean)
    let i = 0
    const next = () => {
      if (genRef.current !== gen) return
      if (i >= lines.length) {
        setPlaying(false)
        return
      }
      const utt = new SpeechSynthesisUtterance(lines[i] + '.')
      utt.lang = 'es-ES'
      utt.rate = 0.82
      utt.pitch = 0.95
      utt.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const es = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Paulina') || v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('female')))
        || voices.find(v => v.lang.startsWith('es'))
      if (es) utt.voice = es
      utt.onend = next
      window.speechSynthesis.speak(utt)
      i++
    }
    playingMcRef.current = mc
    playStartTimeRef.current = Date.now()
    setSelected(mc)
    setPlaying(true)
    setIsPaused(false)
    next()
  }, [])

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

  const handleSelect = useCallback((mc: MasterClass) => {
    claimAndPlay('masterclass', stopMasterclass)
    if (loadingMasterclass === mc.id) return
    if (playing && selected?.id === mc.id && !isPaused) {
      handlePause()
    } else if (playing && selected?.id === mc.id && isPaused) {
      handleResume()
    } else {
      handlePlay(mc)
    }
  }, [playing, selected, isPaused, loadingMasterclass, stopMasterclass, handlePlay, handlePause, handleResume])

  const handleStop = useCallback(() => {
    stopMasterclass()
    setSelected(null)
  }, [stopMasterclass])

  const handleClose = useCallback(() => {
    stopMasterclass()
    setSelected(null)
  }, [stopMasterclass])

  return (
    <div className="relative overflow-hidden">
      <div className="orb w-64 h-64 bg-violet-600 top-10 -right-20" />

      <section className="pt-8 md:pt-16 pb-6">
        <Container>
          <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 animate-fade-in">
            Masterclasses
          </h1>
          <p className="text-text-secondary text-base animate-fade-in-up">
            Neurociencia de la consciencia en audio. Toca para escuchar.
          </p>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <div className="grid md:grid-cols-2 gap-4">
            {masterclasses.map((mc) => (
              <FadeInSection key={mc.id}>
                {mc.free ? (
                  <MasterClassCard mc={mc} onSelect={() => handleSelect(mc)} />
                ) : (
                  <PremiumLock label={mc.title}>
                    <MasterClassCard mc={mc} onSelect={() => handleSelect(mc)} />
                  </PremiumLock>
                )}
              </FadeInSection>
            ))}
          </div>
        </Container>
      </section>

      {/* Modal de reproducción */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${selected.color} flex items-center justify-center shrink-0`}>
                <selected.icon className="w-6 h-6" />
              </div>
              <button onClick={handleClose} className="p-2 -m-2 rounded-lg text-text-muted hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="font-heading font-bold text-white text-lg mb-1">{selected.title}</h2>
            <p className="text-text-muted text-sm mb-4">{selected.subtitle}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelect(selected)}
                disabled={loadingMasterclass === selected.id}
                className="flex-1 py-3 rounded-xl bg-accent-blue text-white font-semibold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
              >
                {loadingMasterclass === selected.id ? (
                  <>Preparando...</>
                ) : playing && !isPaused ? (
                  <>
                    <Pause className="w-5 h-5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> {isPaused ? 'Reanudar' : 'Escuchar'}
                  </>
                )}
              </button>
              <button
                onClick={handleStop}
                className="py-3 px-4 rounded-xl bg-rose-500/20 text-rose-400 font-medium active:scale-95"
              >
                <Square className="w-5 h-5 inline mr-1" /> Parar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
