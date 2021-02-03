// Create async delay for provided timeout in milliseconds

export async function delay(timeoutMs = 1000) {
  if (!timeoutMs) return;
  await new Promise(resolve => setTimeout(resolve, timeoutMs));
}
