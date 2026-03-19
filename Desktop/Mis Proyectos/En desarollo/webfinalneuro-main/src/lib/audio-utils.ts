/**
 * Shared audio helpers for fade-in, fade-out, ambient pad, and ElevenLabs TTS.
 * Used by meditation, podcast, masterclass, and SOS.
 */

export const FADE_IN_MS = 120
export const FADE_OUT_MS = 120

const FADE_IN_DURATION = FADE_IN_MS / 1000
const FADE_OUT_DURATION = FADE_OUT_MS / 1000

export type VoiceRefs = {
  ctx: AudioContext
  gain: GainNode
}

/** Play HTMLAudioElement with smooth fade-in via Web Audio API. Returns refs for fade-out. Compatible con Safari/Chrome. */
export async function playAudioWithFadeIn(audio: HTMLAudioElement): Promise<VoiceRefs> {
  const CtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!CtxClass) throw new Error('Web Audio API no soportada')
  const ctx = new CtxClass()
  const source = ctx.createMediaElementSource(audio)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  source.connect(gain)
  gain.connect(ctx.destination)
  if (ctx.state === 'suspended') await ctx.resume()
  gain.gain.setTargetAtTime(1, ctx.currentTime, FADE_IN_DURATION * 0.4)
  await audio.play()
  return { ctx, gain }
}

/** Fade out voice and run cleanup after fade completes */
export function stopVoiceWithFadeOut(
  audio: HTMLAudioElement | null,
  voiceRefs: VoiceRefs | null,
  url: string | undefined,
  onCleanup: () => void
): void {
  if (!audio) {
    onCleanup()
    return
  }
  if (voiceRefs) {
    voiceRefs.gain.gain.setTargetAtTime(0, voiceRefs.ctx.currentTime, FADE_OUT_DURATION * 0.4)
    setTimeout(() => {
      audio.pause()
      audio.src = ''
      if (url) URL.revokeObjectURL(url)
      try { voiceRefs.ctx.close() } catch { /* ignore */ }
      onCleanup()
    }, FADE_OUT_MS + 20)
  } else {
    audio.pause()
    audio.src = ''
    if (url) URL.revokeObjectURL(url)
    onCleanup()
  }
}

/** Create ambient synth pad with smooth fade-in. Volume 0.15–0.25. Evita clicks en Safari/Chrome. */
export function createAmbientPad(ctx: AudioContext, volume = 0.2): { gain: GainNode; oscs: OscillatorNode[]; stop: () => void } {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.connect(ctx.destination)
  const freqs = [65.41, 82.41, 98, 130.81, 164.81]
  const oscs: OscillatorNode[] = []
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, ctx.currentTime)
    const g = ctx.createGain()
    g.gain.setValueAtTime((0.3 / (i + 1)) * (volume / 0.28), ctx.currentTime)
    osc.connect(g)
    g.connect(gain)
    osc.start(ctx.currentTime + 0.02)
    oscs.push(osc)
  })
  gain.gain.setTargetAtTime(volume, ctx.currentTime + 0.05, 0.2)

  const stop = () => {
    gain.gain.setTargetAtTime(0, ctx.currentTime, FADE_OUT_DURATION * 0.4)
    setTimeout(() => {
      oscs.forEach(o => { try { o.stop(ctx.currentTime) } catch { /* ignore */ } })
      try { ctx.close() } catch { /* ignore */ }
    }, FADE_OUT_MS + 20)
  }
  return { gain, oscs, stop }
}

/** ElevenLabs TTS fetch with abort and timeout. Returns null on failure/abort. */
const ELEVENLABS_TIMEOUT_MS = 45000

export async function fetchElevenLabsTTS(
  text: string,
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<Blob | null> {
  const controller = new AbortController()
  const timeoutMs = options?.timeoutMs ?? ELEVENLABS_TIMEOUT_MS
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const signal = options?.signal
  const onAbort = () => {
    clearTimeout(timeoutId)
    controller.abort()
  }
  if (signal?.aborted) return null
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const res = await fetch('/api/elevenlabs/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 5000) }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('audio')) return null
    return await res.blob()
  } catch {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
    return null
  }
}
