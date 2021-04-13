import { action, computed, IReactionDisposer, observable, reaction } from "mobx";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { CatalogEntity, CatalogEntityActionContext } from "../../api/catalog-entity";
import { ItemObject, ItemStore } from "../../item.store";
import { autobind } from "../../utils";
import { CatalogCategory } from "../../../common/catalog-entity";

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

  @computed get phase() {
    return this.entity.status.phase;
  }

  get labels() {
    const labels: string[] = [];

    Object.keys(this.entity.metadata.labels).forEach((key) => {
      const value = this.entity.metadata.labels[key];

      labels.push(`${key}=${value}`);
    });

    return labels;
  }

  get source() {
    return this.entity.metadata.source || "unknown";
  }

  onRun(ctx: CatalogEntityActionContext) {
    this.entity.onRun(ctx);
  }

  @action
  async onContextMenuOpen(ctx: any) {
    return this.entity.onContextMenuOpen(ctx);
  }
}

@autobind()
export class CatalogEntityStore extends ItemStore<CatalogEntityItem> {
  @observable activeCategory: CatalogCategory;

  @computed get entities() {
    if (!this.activeCategory) return [];

    return catalogEntityRegistry.getItemsForCategory(this.activeCategory).map(entity => new CatalogEntityItem(entity));
  }

  watch() {
    const disposers: IReactionDisposer[] = [
      reaction(() => this.entities, () => this.loadAll()),
      reaction(() => this.activeCategory, () => this.loadAll(), { delay: 100})
    ];

    return () => disposers.forEach((dispose) => dispose());
  }

  loadAll() {
    return this.loadItems(() => this.entities);
  }
}
