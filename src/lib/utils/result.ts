// Result monad for error handling
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } =>
  result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
  !result.ok;

export const map =
  <T, U, E>(fn: (t: T) => U) =>
  (result: Result<T, E>): Result<U, E> =>
    result.ok ? Ok(fn(result.value)) : result;

export const mapError =
  <T, E, F>(fn: (e: E) => F) =>
  (result: Result<T, E>): Result<T, F> =>
    result.ok ? result : Err(fn(result.error));

export const flatMap =
  <T, U, E>(fn: (t: T) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> =>
    result.ok ? fn(result.value) : result;

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) return result.value;
  throw new Error(`Tried to unwrap an Err: ${String(result.error)}`);
};

export const unwrapOr =
  <T>(defaultValue: T) =>
  <E>(result: Result<T, E>): T =>
    result.ok ? result.value : defaultValue;

export const unwrapOrElse =
  <T, E>(fn: (e: E) => T) =>
  (result: Result<T, E>): T =>
    result.ok ? result.value : fn(result.error);

export const match =
  <T, E, U>(onOk: (t: T) => U, onErr: (e: E) => U) =>
  (result: Result<T, E>): U =>
    result.ok ? onOk(result.value) : onErr(result.error);

const defaultMapError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e));

export const fromPromise = async <T, E = Error>(
  promise: Promise<T>,
  mapError: (e: unknown) => E = defaultMapError as (e: unknown) => E
): Promise<Result<T, E>> => {
  try {
    const value = await promise;
    return Ok(value);
  } catch (e) {
    return Err(mapError(e));
  }
};

export const fromNullable = <T>(
  value: T | null | undefined,
  error: () => string = () => 'Value is null or undefined'
): Result<T, string> => (value != null ? Ok(value) : Err(error()));

// Convert Zod SafeParseReturnType to Result
export const fromZodResult = <T>(
  zodResult: { success: true; data: T } | { success: false; error: { issues: { message: string }[] } }
): Result<T, string> => {
  if (zodResult.success) {
    return Ok(zodResult.data);
  }
  const messages = zodResult.error.issues.map((i) => i.message).join(', ');
  return Err(messages);
};

// Namespaced export for disambiguation with Option.map
export const Result = {
  Ok,
  Err,
  isOk,
  isErr,
  map,
  mapError,
  flatMap,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  match,
  fromPromise,
  fromNullable,
  fromZodResult
} as const;
