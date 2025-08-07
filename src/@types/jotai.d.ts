import type {createStore} from 'jotai'

declare module 'jotai' {
  type Store = ReturnType<typeof createStore>
}
