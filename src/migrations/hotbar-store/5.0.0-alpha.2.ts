// Cleans up a store that had the state related data stored
import { Hotbar } from "../../common/hotbar-store";
import { migration } from "../migration-wrapper";
import * as uuid from "uuid";

export default migration({
  version: "5.0.0-alpha.2",
  run(store) {
    const hotbars = (store.get("hotbars") || []) as Hotbar[];

    store.set("hotbars", hotbars.map((hotbar) => ({
      id: uuid.v4(),
      ...hotbar
    })));
  }
});
