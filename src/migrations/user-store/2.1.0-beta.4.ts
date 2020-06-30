// Add / reset "lastSeenAppVersion"
export function migration(store: any) {
  store.set("lastSeenAppVersion", "0.0.0");
}
