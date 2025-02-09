import {parse, stringify} from 'devalue'

import {APP_NAME} from '@/constants/config'

import errorMessageOrUndefined from './errors/errorMessageOrUndefined'
import ErrorWithMetadata from './errors/ErrorWithMetadata'
import type {ErrorMetadata} from './logger'

const localStorage = globalThis.localStorage
const sessionStorage = globalThis.sessionStorage

class SimpleStorageError extends ErrorWithMetadata {
  constructor(name: string, message?: string, metadata?: ErrorMetadata, options?: ErrorOptions) {
    super('SimpleStorageError', name, message, metadata, options)
    this.permanent()
  }
}

function generateKey(key: string) {
  return `${APP_NAME}_${key}` // prefix_key
}

export function isStorageEventOfKey(key: string, event: unknown): event is StorageEvent {
  return event instanceof StorageEvent && event.key === generateKey(key)
}

function set<T>(key: string, value: T, session?: boolean) {
  const storage = session ? sessionStorage : localStorage

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this can sometimes run server side
  if (!storage) {
    throw new SimpleStorageError('NotAvailable', 'local storage is not available')
  }

  try {
    const rawValue = stringify(value)
    const k = generateKey(key)
    // Dispatch a storage event for persistent, because the original storage event only dispatch when the storage is updated from another context (another tab, another window, etc.)
    const event = new StorageEvent('simpleStorage', {
      key: k,
      newValue: rawValue,
      oldValue: storage.getItem(k),
      url: globalThis.location.href,
      storageArea: storage,
    })
    storage.setItem(k, rawValue)
    globalThis.dispatchEvent(event)
    return value
  } catch (error) {
    throw new SimpleStorageError('Set', errorMessageOrUndefined(error), {
      value,
      error,
      isSessionStorage: !!session,
    })
  }
}

function remove(key: string, session?: boolean) {
  const storage = session ? sessionStorage : localStorage

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this can sometimes run server side
  if (!storage) {
    throw new SimpleStorageError('NotAvailable', 'local storage is not available')
  }

  const k = generateKey(key)
  const event = new StorageEvent('simpleStorage', {
    key: k,
    newValue: null,
    oldValue: storage.getItem(k),
    url: globalThis.location.href,
    storageArea: storage,
  })
  storage.removeItem(k)
  globalThis.dispatchEvent(event)
}

function get(key: string, defaultValue?: unknown, session?: boolean): unknown {
  const storage = session ? sessionStorage : localStorage

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this can sometimes run server side
  if (!storage) {
    throw new SimpleStorageError('NotAvailable', 'local storage is not available')
  }

  const rawValue = storage.getItem(generateKey(key))
  if (rawValue) {
    try {
      return parse(rawValue)
    } catch (error) {
      throw new SimpleStorageError('Get', errorMessageOrUndefined(error), {
        key,
        error,
        isSessionStorage: !!session,
      })
    }
  }

  return defaultValue
}

function clear(session?: boolean) {
  const storage = session ? sessionStorage : localStorage

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this can sometimes run server side
  if (!storage) {
    throw new SimpleStorageError('[simple storage] storage is not available')
  }

  try {
    storage.clear()
    const event = new StorageEvent('simpleStorage', {
      key: null,
      newValue: null,
      oldValue: null,
      url: globalThis.location.href,
      storageArea: storage,
    })
    globalThis.dispatchEvent(event)
  } catch (error) {
    throw new SimpleStorageError('Clear', errorMessageOrUndefined(error), {
      error,
      isSessionStorage: !!session,
    })
  }
}

const simpleStorage = {clear, get, set, remove}

export default simpleStorage
