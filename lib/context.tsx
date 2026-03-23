'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

/* ──────────────────────────────────────────
   TOAST CONTEXT
────────────────────────────────────────── */
interface ToastCtx {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })
export const useToast = () => useContext(ToastContext)

/* ──────────────────────────────────────────
   MODAL CONTEXT
────────────────────────────────────────── */
interface ModalOptions {
  title: string
  body: React.ReactNode
  confirmText?: string
  onConfirm?: () => void
}

interface ModalCtx {
  showModal: (opts: ModalOptions) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalCtx>({
  showModal: () => {},
  closeModal: () => {},
})
export const useModal = () => useContext(ModalContext)

/* ──────────────────────────────────────────
   COMBINED PROVIDER
────────────────────────────────────────── */
interface Toast {
  id: number
  msg: string
  out: boolean
}

interface ModalState extends ModalOptions {
  open: boolean
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    body: null,
    confirmText: 'CONFIRMAR',
  })

  /* ── Toast ── */
  const showToast = useCallback((msg: string) => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, msg, out: false }])

    setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, out: true } : t)))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 300)
    }, 2500)
  }, [])

  /* ── Modal ── */
  const showModal = useCallback((opts: ModalOptions) => {
    setModal({ ...opts, open: true })
  }, [])

  const closeModal = useCallback(() => {
    setModal(m => ({ ...m, open: false }))
  }, [])

  const handleConfirm = () => {
    modal.onConfirm?.()
    closeModal()
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ModalContext.Provider value={{ showModal, closeModal }}>
        {children}

        {/* Toasts */}
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.out ? ' out' : ''}`}>
            {t.msg}
          </div>
        ))}

        {/* Modal */}
        <div className={`modal-overlay${modal.open ? ' open' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal.title}</div>
            <div className="modal-body">{modal.body}</div>
            <div className="modal-actions">
              <div className="cyber-button secondary" onClick={closeModal}>
                <span className="button-text">CANCELAR</span>
              </div>
              <div className="cyber-button" onClick={handleConfirm}>
                <span className="button-text">{modal.confirmText ?? 'CONFIRMAR'}</span>
              </div>
            </div>
          </div>
        </div>
      </ModalContext.Provider>
    </ToastContext.Provider>
  )
}
