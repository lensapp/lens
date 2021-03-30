import { computed, reaction } from "mobx";
import { CatalogEntity, catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { ItemObject, ItemStore } from "../../item.store";
import { autobind } from "../../utils";

export class CatalogEntityItem implements ItemObject {
  constructor(public entity: CatalogEntity) {}

  get name() {
    return this.entity.metadata.name;
  }

  getName() {
    return this.entity.metadata.name;
  }

  get id() {
    return this.entity.metadata.uid;
  }

  getId() {
    return this.id;
  }

  get phase() {
    return this.entity.status.phase;
  }

  onRun(ctx: any) {
    this.entity.onRun(ctx);
  }
}

@autobind()
export class CatalogEntityStore extends ItemStore<CatalogEntityItem> {

  @computed get entities() {
    return catalogEntityRegistry.items.map(entity => new CatalogEntityItem(entity));
  }

  watch() {
    return reaction(() => this.entities, () => this.loadAll());
  }

  loadAll() {
    return this.loadItems(() => this.entities);
  }
}
