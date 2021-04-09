import { navigate } from "../navigation";
import { commandRegistry } from "../../extensions/registries";
import { CatalogEntity } from "../../common/catalog-entity";

export {
  CatalogCategory,
  CatalogEntity,
  CatalogEntityData,
  CatalogEntityActionContext,
  CatalogEntityAddMenuContext,
  CatalogEntityContextMenu,
  CatalogEntityContextMenuContext
} from "../../common/catalog-entity";

export const catalogEntityRunContext = {
  navigate: (url: string) => navigate(url),
  setCommandPaletteContext: (entity?: CatalogEntity) => {
    commandRegistry.activeEntity = entity;
  }
};
