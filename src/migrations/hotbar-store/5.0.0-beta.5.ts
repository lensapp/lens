import type { Hotbar } from "../../common/hotbar-store";
import { migration } from "../migration-wrapper";
import { catalogEntityRegistry } from "../../renderer/api/catalog-entity-registry";

export default migration({
  version: "5.0.0-beta.5",
  run(store) {
    const hotbars: Hotbar[] = store.get("hotbars");

    hotbars.forEach((hotbar, hotbarIndex) => {
      hotbar.items.forEach((item, itemIndex) => {
        const entity = catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item?.entity.uid);

        if (!entity) {
          // Clear disabled item
          hotbars[hotbarIndex].items[itemIndex] = null;
        } else {
          // Save additional data
          hotbars[hotbarIndex].items[itemIndex].entity = {
            ...item.entity,
            name: entity.metadata.name,
            source: entity.metadata.source
          };
        }
      });
    });

    store.set("hotbars", hotbars);
  }
});
