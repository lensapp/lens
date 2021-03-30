import { action, computed, observable, toJS } from "mobx";
import { CatalogCategory, CatalogEntityData } from "./catalog-entity";

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

  getEntityForData(data: CatalogEntityData) {
    const splitApiVersion = data.apiVersion.split("/");
    const group = splitApiVersion[0];
    const version = splitApiVersion[1];

    const category = this.categories.find((category) => {
      return category.spec.group === group && category.spec.names.kind === data.kind;
    });

    if (!category) {
      return null;
    }

    const specVersion = category.spec.versions.find((v) => v.name === version);

    if (!specVersion) {
      return null;
    }

    return new specVersion.entityClass(data);
  }
}

export const catalogCategoryRegistry = new CatalogCategoryRegistry();
