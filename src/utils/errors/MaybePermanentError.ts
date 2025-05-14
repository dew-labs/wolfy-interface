import isTypeError from '@/utils/schema/isTypeError'

export default class MaybePermanentError extends Error {
  isPermanent: boolean = false

  permanent() {
    this.isPermanent = true
    return this
  }
}

export function isPermanentError(e: unknown): e is MaybePermanentError {
  try {
    if (isTypeError(e)) return true
    if (e && typeof e === 'object' && 'isPermanent' in e) {
      return !!e.isPermanent
    }
    return false
  } catch {
    return false
  }
}
