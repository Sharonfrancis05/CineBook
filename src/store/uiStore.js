import { create } from 'zustand'

let toastId = 0

export const useUIStore = create((set, get) => ({
  toasts: [],
  pushToast: (message, type = 'info') => {
    const id = ++toastId
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => get().dismissToast(id), 3500)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
