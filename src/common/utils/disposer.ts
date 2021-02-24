export type Disposer = () => void;

interface Extendable<T> {
  push(...vals: T[]): void;
}

export function disposer(...args: Disposer[]): Disposer & Extendable<Disposer> {
  const res = () => {
    args.forEach(dispose => dispose?.());
    args.length = 0;
  };

  res.push = (...vals: Disposer[]) => {
    args.push(...vals);
  };

  return res;
}
