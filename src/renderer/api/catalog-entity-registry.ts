import { action, observable } from "mobx";
import { broadcastMessage, subscribeToBroadcast } from "../../common/ipc";
import { CatalogCategory, CatalogEntity, CatalogEntityData, catalogCategoryRegistry, CatalogCategoryRegistry, CatalogEntityKindData } from "../../common/catalog";
import "../../common/catalog-entities";

export class CatalogEntityRegistry {
  @observable protected _items: CatalogEntity[] = observable.array([], { deep: true });
  @observable protected _activeEntity: CatalogEntity;

  constructor(private categoryRegistry: CatalogCategoryRegistry) {}

  init() {
    subscribeToBroadcast("catalog:items", (ev, items: (CatalogEntityData & CatalogEntityKindData)[]) => {
      this.updateItems(items);
    });
    broadcastMessage("catalog:broadcast");
  }

  @action updateItems(items: (CatalogEntityData & CatalogEntityKindData)[]) {
    this._items.forEach((item, index) => {
      const foundIndex = items.findIndex((i) => i.apiVersion === item.apiVersion && i.kind === item.kind && i.metadata.uid === item.metadata.uid);

      if (foundIndex === -1) {
        this._items.splice(index, 1);
      }
    });

    items.forEach((data) => {
      const item = this.categoryRegistry.getEntityForData(data);

      if (!item) return; // invalid data

      const index = this._items.findIndex((i) => i.apiVersion === item.apiVersion && i.kind === item.kind && i.metadata.uid === item.metadata.uid);

      if (index === -1) {
        this._items.push(item);
      } else {
        this._items.splice(index, 1, item);
      }
    });
  }

  set activeEntity(entity: CatalogEntity) {
    this._activeEntity = entity;
  }

  get activeEntity() {
    return this._activeEntity;
  }

  get items() {
    return this._items;
  }

  getById(id: string) {
    return this._items.find((entity) => entity.metadata.uid === id);
  }

  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[] {
    const items = this._items.filter((item) => item.apiVersion === apiVersion && item.kind === kind);

    return items as T[];
  }

  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory): T[] {
    const supportedVersions = category.spec.versions.map((v) => `${category.spec.group}/${v.name}`);
    const items = this._items.filter((item) => supportedVersions.includes(item.apiVersion) && item.kind === category.spec.names.kind);

    return items as T[];
  }
}

export const catalogEntityRegistry = new CatalogEntityRegistry(catalogCategoryRegistry);
