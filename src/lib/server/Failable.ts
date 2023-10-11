
// Failable is a type that represents a value that can fail.
// This is useful for functions that can return a value or an error.
export type Failable<R, Err, Ex = unknown> = { ok: true; value: R } | { ok: false; error: Err, exception?: Ex };