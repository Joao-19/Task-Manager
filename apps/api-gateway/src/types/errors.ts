/**
 * Error with HTTP response
 */
export interface HttpError extends Error {
  response?: {
    data?: string | Record<string, unknown>;
    status?: number;
  };
}

/**
 * Type guard to check if error is an HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof Error &&
    'response' in error &&
    typeof error.response === 'object'
  );
}
