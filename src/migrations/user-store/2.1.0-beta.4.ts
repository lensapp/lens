// Add / reset "lastSeenAppVersion"
import { migration } from "../migration-wrapper";

export default migration({
  version: "2.1.0-beta.4",
  run(store) {
    store.set("lastSeenAppVersion", "0.0.0");
  }
});
