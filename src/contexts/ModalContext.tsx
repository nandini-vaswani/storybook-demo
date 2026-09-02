'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { CtaItem } from '@/components/button'

// Ported from apps/web/src/contexts/ModalContext.tsx (hgu-platform) — `body` was
// SerializedEditorState (a Payload/Lexical type); dropped since this sandbox has no
// Payload dependency and nothing here renders modal body content.
export interface ModalData {
  modalId: string
  headline?: string | null
  subtitle?: string | null
  ctas?: CtaItem[] | null
  closeOnBackdrop?: boolean | null
  storiesEnabled?: boolean
}

interface ModalContextValue {
  openModal: (data: ModalData) => void
  closeModal: () => void
  activeModal: ModalData | null
  registerModal: (data: ModalData) => void
  getModal: (modalId: string) => ModalData | undefined
  storiesEnabled: boolean
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({
  children,
  storiesEnabled = true,
}: {
  children: React.ReactNode
  storiesEnabled?: boolean
}) {
  const [activeModal, setActiveModal] = useState<ModalData | null>(null)
  const [registry, setRegistry] = useState<Map<string, ModalData>>(new Map())

  const registerModal = useCallback((data: ModalData) => {
    setRegistry((prev) => {
      const next = new Map(prev)
      next.set(data.modalId, data)
      return next
    })
  }, [])

  const getModal = useCallback((modalId: string) => registry.get(modalId), [registry])

  const openModal = useCallback((data: ModalData) => {
    setActiveModal(data)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, activeModal, registerModal, getModal, storiesEnabled }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
