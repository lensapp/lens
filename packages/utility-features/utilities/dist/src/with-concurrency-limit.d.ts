export type ConcurrencyLimiter = <Args extends any[], Res>(fn: (...args: Args) => Res) => (...args: Args) => Promise<Res>;
export declare function withConcurrencyLimit(limit: number): ConcurrencyLimiter;
