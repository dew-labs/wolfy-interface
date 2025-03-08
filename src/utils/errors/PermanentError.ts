import MaybePermanentError from './MaybePermanentError'

export default class PermanentError extends MaybePermanentError {
  override isPermanent = true
}
