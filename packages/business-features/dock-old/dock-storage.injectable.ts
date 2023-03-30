import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import type { DockStorageState } from "./store";

const dockStorageInjectable = getInjectable({
  id: "dock-storage",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage<DockStorageState>("dock", {
      height: 300,
      tabs: [
        // {
        //   id: "terminal",
        //   kind: TabKind.TERMINAL,
        //   title: "Terminal",
        //   pinned: false,
        // },
      ],
      isOpen: false,
    });
  },
});

export default dockStorageInjectable;
