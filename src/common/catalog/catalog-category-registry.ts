import { action, computed, observable, toJS } from "mobx";
import { CatalogCategory, CatalogEntityData, CatalogEntityKindData } from "./catalog-entity";

export class CatalogCategoryRegistry {
  @observable protected categories: CatalogCategory[] = [];

  @action add(category: CatalogCategory) {
    this.categories.push(category);
  }

  @action remove(category: CatalogCategory) {
    this.categories = this.categories.filter((cat) => cat.apiVersion !== category.apiVersion && cat.kind !== category.kind);
  }

  @computed get items() {
    return toJS(this.categories);
  }

  getForGroupKind<T extends CatalogCategory>(group: string, kind: string) {
    return this.categories.find((c) => c.spec.group === group && c.spec.names.kind === kind) as T;
  }

  getEntityForData(data: CatalogEntityData & CatalogEntityKindData) {
    const category = this.getCategoryForEntity(data);

    if (!category) {
      return null;
    }

    const splitApiVersion = data.apiVersion.split("/");
    const version = splitApiVersion[1];

    const specVersion = category.spec.versions.find((v) => v.name === version);

    if (!specVersion) {
      return null;
    }

    return new specVersion.entityClass(data);
  }

  getCategoryForEntity<T extends CatalogCategory>(data: CatalogEntityData & CatalogEntityKindData) {
    const splitApiVersion = data.apiVersion.split("/");
    const group = splitApiVersion[0];

    const category = this.categories.find((category) => {
      return category.spec.group === group && category.spec.names.kind === data.kind;
    });

    if (!category) return null;

    return category as T;
  }
}

export const catalogCategoryRegistry = new CatalogCategoryRegistry();
