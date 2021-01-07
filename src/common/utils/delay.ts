export function delay(duration: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}
