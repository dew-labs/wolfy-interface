// NOTE: remember to update vite-env.d.ts
export const APP_NAME = import.meta.env.VITE_APP_NAME
export const API_URL = import.meta.env.VITE_API_URL
export const TITLE = import.meta.env.VITE_APP_TITLE
export const DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION
export const MODE = import.meta.env.MODE
export const DEBUG = ['test', 'development'].includes(import.meta.env.MODE)
export const UI_FEE_RECEIVER_ADDRESS =
  '0x0746CA2519Aaa863327f7D0147590c2e0f949feD3D61f2A160c356A7332cAE26'
