// Switch representation of hiddenTableColumns in store
import { migration } from "../migration-wrapper";

export default migration({
  version: "5.0.0-alpha.3",
  run(store) {
    const preferences = store.get("preferences");
    const oldHiddenTableColumns: Record<string, string[]> = preferences?.hiddenTableColumns;

    if (!oldHiddenTableColumns) {
      return;
    }

    preferences.hiddenTableColumns = Object.entries(oldHiddenTableColumns);

    store.set("preferences", preferences);
  }
});
