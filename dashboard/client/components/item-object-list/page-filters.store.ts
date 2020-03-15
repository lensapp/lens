import { computed, observable, reaction } from "mobx";
import { autobind } from "../../utils";
import { getSearch, setSearch } from "../../navigation";
import { namespaceStore } from "../+namespaces/namespace.store";

export enum FilterType {
  SEARCH = "search",
  NAMESPACE = "namespace",
}

export interface Filter {
  type: FilterType;
  value: string;
}

@autobind()
export class PageFiltersStore {
  protected filters = observable.array<Filter>([], { deep: false });
  protected isDisabled = observable.map<FilterType, boolean>();

  @computed get activeFilters() {
    return this.filters.filter(filter => !this.isDisabled.get(filter.type));
  }

  constructor() {
    this.syncWithGlobalSearch();
    this.syncWithContextNamespace();
  }

  protected syncWithContextNamespace() {
    const disposers = [
      reaction(() => this.getValues(FilterType.NAMESPACE), filteredNs => {
        if (filteredNs.length !== namespaceStore.contextNs.length) {
          namespaceStore.setContext(filteredNs);
        }
      }),
      reaction(() => namespaceStore.contextNs.toJS(), contextNs => {
        const filteredNs = this.getValues(FilterType.NAMESPACE);
        const isChanged = contextNs.length !== filteredNs.length;
        if (isChanged) {
          this.filters.replace([
            ...this.filters.filter(({ type }) => type !== FilterType.NAMESPACE),
            ...contextNs.map(ns => ({ type: FilterType.NAMESPACE, value: ns })),
          ]);
        }
      }, {
        fireImmediately: true
      })
    ];
    return () => disposers.forEach(dispose => dispose());
  }

  protected syncWithGlobalSearch() {
    const disposers = [
      reaction(() => this.getValues(FilterType.SEARCH)[0], setSearch),
      reaction(() => getSearch(), search => {
        const filter = this.getByType(FilterType.SEARCH);
        if (filter) {
          this.removeFilter(filter); // search filter might occur once
        }
        if (search) {
          this.addFilter({ type: FilterType.SEARCH, value: search }, true);
        }
      }, {
        fireImmediately: true
      })
    ];
    return () => disposers.forEach(dispose => dispose());
  }

  addFilter(filter: Filter, begin = false) {
    if (begin) this.filters.unshift(filter);
    else {
      this.filters.push(filter);
    }
  }

  removeFilter(filter: Filter) {
    if (!this.filters.remove(filter)) {
      const filterCopy = this.filters.find(f => f.type === filter.type && f.value === filter.value);
      if (filterCopy) this.filters.remove(filterCopy);
    }
  }

  getByType(type: FilterType, value?: any): Filter {
    return this.filters.find(filter => filter.type === type && (
      arguments.length > 1 ? filter.value === value : true
    ))
  }

  getValues(type: FilterType) {
    return this.filters
      .filter(filter => filter.type === type)
      .map(filter => filter.value);
  }

  isEnabled(type: FilterType) {
    return !this.isDisabled.get(type);
  }

  disable(type: FilterType | FilterType[]) {
    [type].flat().forEach(type => this.isDisabled.set(type, true));
    return () => this.enable(type);
  }

  enable(type: FilterType | FilterType[]) {
    [type].flat().forEach(type => this.isDisabled.delete(type));
    return () => this.disable(type);
  }

  reset() {
    this.filters.length = 0;
    this.isDisabled.clear();
  }
}

export const pageFilters = new PageFiltersStore();
