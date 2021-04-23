import { navigate } from "../navigation";
import { commandRegistry } from "../../extensions/registries";
import { CatalogEntity } from "../../common/catalog";

export {
  CatalogCategory,
  CatalogEntity,
  CatalogEntityData,
  CatalogEntityKindData,
  CatalogEntityActionContext,
  CatalogEntityAddMenuContext,
  CatalogEntityContextMenu,
  CatalogEntityContextMenuContext
} from "../../common/catalog";

export const catalogEntityRunContext = {
  navigate: (url: string) => navigate(url),
  setCommandPaletteContext: (entity?: CatalogEntity) => {
    commandRegistry.activeEntity = entity;
  }
};
