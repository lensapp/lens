export {}

declare global {
  interface Element {
    scrollIntoViewIfNeeded(opt_center?: boolean): void;
  }
}