// Get Result or Error from Synchronous Expression (Golang Style)
export function tryCatch<T>(expression: () => T): [Error, undefined] | [undefined, T] {
  try {
    const result = expression();
    return [undefined, result];
  } catch (err) {
    return [err, undefined];
  }
}

// Get Result or Error from Asynchronous Promise (Golang Style)
export async function tryCatchAsync<T>(promise: Promise<T>): Promise<[Error, undefined] | [undefined, T]> {
  try {
    return [undefined, await promise];
  } catch (err) {
    return [err, undefined];
  }
}
