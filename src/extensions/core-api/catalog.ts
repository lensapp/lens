
import { CatalogEntity } from "../../common/catalog-entity";
import { catalogEntityRegistry as registry } from "../../common/catalog-entity-registry";

export { catalogCategoryRegistry as catalogCategories } from "../../common/catalog-category-registry";
export * from "../../common/catalog-entities";

export class CatalogEntityRegistry {
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return registry.getItemsForApiKind<T>(apiVersion, kind);
  }
}

export const catalogEntities = new CatalogEntityRegistry();
