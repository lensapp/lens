// Cleans up a store that had the state related data stored
import { Hotbar } from "../../common/hotbar-store";
import { migration } from "../migration-wrapper";
import { v4 as uuid } from "uuid";

export default migration({
  version: "5.0.0-alpha.2",
  run(store) {
    const hotbars = (store.get("hotbars") || []) as Hotbar[];

    hotbars.forEach((hotbar) => {
      if (!hotbar.id) {
        hotbar.id = uuid();
      }
    });

    store.set("hotbars", hotbars);
  }
});
