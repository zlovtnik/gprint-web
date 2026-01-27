// Option monad for nullable handling
export type Option<T> = { readonly some: true; readonly value: T } | { readonly some: false };

export const Some = <T>(value: T): Option<T> => ({ some: true, value });
export const None: Option<never> = { some: false };

export const isSome = <T>(opt: Option<T>): opt is { some: true; value: T } => opt.some;

export const isNone = <T>(opt: Option<T>): opt is { some: false } => !opt.some;

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value != null ? Some(value) : None;

export const map =
  <T, U>(fn: (t: T) => U) =>
  (opt: Option<T>): Option<U> =>
    opt.some ? Some(fn(opt.value)) : None;

export const flatMap =
  <T, U>(fn: (t: T) => Option<U>) =>
  (opt: Option<T>): Option<U> =>
    opt.some ? fn(opt.value) : None;

export const filter =
  <T>(predicate: (t: T) => boolean) =>
  (opt: Option<T>): Option<T> =>
    opt.some && predicate(opt.value) ? opt : None;

export const unwrap = <T>(opt: Option<T>): T => {
  if (opt.some) return opt.value;
  throw new Error('Tried to unwrap a None value');
};

export const unwrapOr =
  <T>(defaultValue: T) =>
  (opt: Option<T>): T =>
    opt.some ? opt.value : defaultValue;

export const unwrapOrElse =
  <T>(fn: () => T) =>
  (opt: Option<T>): T =>
    opt.some ? opt.value : fn();

export const match =
  <T, U>(onSome: (t: T) => U, onNone: () => U) =>
  (opt: Option<T>): U =>
    opt.some ? onSome(opt.value) : onNone();

export const toNullable = <T>(opt: Option<T>): T | null =>
  opt.some ? opt.value : null;

export const toUndefined = <T>(opt: Option<T>): T | undefined =>
  opt.some ? opt.value : undefined;

// Namespaced export for disambiguation with Result.map
export const Option = {
  Some,
  None,
  isSome,
  isNone,
  fromNullable,
  map,
  flatMap,
  filter,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  match,
  toNullable,
  toUndefined
} as const;
