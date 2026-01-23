type CreateErrorOptions = {
  statusCode?: number;
  statusMessage?: string;
  message?: string;
};

/**
 * Wrapper around Nuxt's createError that falls back to a plain Error
 * when running outside of Nuxt's context (e.g., standalone scripts).
 *
 * Named with underscore to avoid conflicting with Nuxt's auto-import.
 * Import explicitly: `import { _createError as createError } from '~~/server/utils/createError'`
 */
export function createErrorCrossEnv(options: CreateErrorOptions): Error {
  // Check if Nuxt's createError is available as a global
  const nuxtCreateError = (globalThis as Record<string, unknown>).createError;
  if (typeof nuxtCreateError === 'function') {
    return nuxtCreateError(options) as Error;
  }

  // Fallback: return a plain Error with the message
  const message = options.statusMessage || options.message || 'Unknown error';
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = options.statusCode;
  return error;
}
