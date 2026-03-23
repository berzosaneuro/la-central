'use client'

import { useState } from 'react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export default function InstallPrompt() {
  const { platform, isInstalled, triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  if (isInstalled || dismissed) return null

  /* ── Android Banner ── */
  if (platform === 'android') {
    return (
      <div className="install-banner">
        <div className="install-banner-text">
          <div className="install-banner-title">📲 INSTALAR TITAN OS</div>
          <div className="install-banner-sub">Acceso rápido desde tu pantalla de inicio</div>
        </div>
        <div
          className="cyber-button"
          style={{ width: 'auto', padding: '0 16px', margin: 0, height: 40 }}
          onClick={triggerInstall}
        >
          <span className="button-text" style={{ fontSize: 12 }}>INSTALAR</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', color: 'var(--metal-grey)',
            cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  /* ── iOS Banner + Guide ── */
  if (platform === 'ios') {
    return (
      <>
        <div className="install-banner">
          <div className="install-banner-text">
            <div className="install-banner-title">📲 INSTALAR EN iPHONE</div>
            <div className="install-banner-sub">Añade la app a tu pantalla de inicio</div>
          </div>
          <div
            className="cyber-button secondary"
            style={{ width: 'auto', padding: '0 16px', margin: 0, height: 40 }}
            onClick={() => setShowIosGuide(true)}
          >
            <span className="button-text" style={{ fontSize: 12 }}>VER CÓMO</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--metal-grey)',
              cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {showIosGuide && (
          <div className="ios-guide-overlay" onClick={() => setShowIosGuide(false)}>
            <div className="ios-guide-card" onClick={e => e.stopPropagation()}>
              <div className="modal-title" style={{ marginBottom: 20 }}>
                INSTALAR EN iPHONE
              </div>

              <div className="ios-guide-step">
                <div className="ios-step-num">1</div>
                <div className="ios-step-text">
                  Toca el botón <strong style={{ color: 'var(--neon-blue)' }}>Compartir</strong> en la barra inferior de Safari
                  &nbsp;
                  <span style={{ fontSize: 20 }}>⎙</span>
                </div>
              </div>

              <div className="ios-guide-step">
                <div className="ios-step-num">2</div>
                <div className="ios-step-text">
                  Desplázate y selecciona{' '}
                  <strong style={{ color: 'var(--neon-blue)' }}>
                    &quot;Añadir a pantalla de inicio&quot;
                  </strong>
                </div>
              </div>

              <div className="ios-guide-step">
                <div className="ios-step-num">3</div>
                <div className="ios-step-text">
                  Confirma pulsando <strong style={{ color: 'var(--neon-blue)' }}>Añadir</strong> en la esquina superior derecha
                </div>
              </div>

              <div
                className="cyber-button"
                style={{ marginTop: 20 }}
                onClick={() => setShowIosGuide(false)}
              >
                <span className="button-text">ENTENDIDO</span>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}
