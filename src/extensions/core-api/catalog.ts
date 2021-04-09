
import { computed } from "mobx";
import { CatalogEntity } from "../../common/catalog-entity";
import { catalogEntityRegistry as registry } from "../../common/catalog-entity-registry";

export class CatalogEntityRegistry {
  @computed getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    return registry.getItemsForApiKind<T>(apiVersion, kind);
  }
}

export const catalogEntities = new CatalogEntityRegistry();
