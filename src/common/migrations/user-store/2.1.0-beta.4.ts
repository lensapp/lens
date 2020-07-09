// Add / reset "lastSeenAppVersion"
export function migration(store: any): void {
  store.set("lastSeenAppVersion", "0.0.0");
}
