import { isDemo } from '../lib/env'
import type { Backend } from './backend'
import { localBackend } from './localBackend'
import { firebaseBackend } from './firebaseBackend'

// Single place where demo vs. production is decided.
export const backend: Backend = isDemo ? localBackend : firebaseBackend

export * from './types'
