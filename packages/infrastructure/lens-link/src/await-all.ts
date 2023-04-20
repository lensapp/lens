export const awaitAll = <T extends Promise<unknown>[]>(x: T) => Promise.all(x);
