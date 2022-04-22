/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable, reaction, makeObservable, action } from "mobx";
import type { PageParam } from "../../../navigation";
import { autoBind } from "../../../utils";

export enum FilterType {
  SEARCH = "search",
}

export interface Filter {
  type: FilterType;
  value: string;
}

interface Dependencies {
  readonly searchUrlParam: PageParam<string>;
}

export class PageFiltersStore {
  protected filters = observable.array<Filter>([], { deep: false });
  protected isDisabled = observable.map<FilterType, boolean>();

  @computed get activeFilters() {
    return this.filters.filter(filter => !this.isDisabled.get(filter.type));
  }

  constructor(protected readonly dependencies: Dependencies) {
    makeObservable(this);
    autoBind(this);

    this.syncWithGlobalSearch();
  }

  protected syncWithGlobalSearch() {
    const disposers = [
      reaction(() => this.getValues(FilterType.SEARCH)[0], search => this.dependencies.searchUrlParam.set(search)),
      reaction(() => this.dependencies.searchUrlParam.get(), search => {
        const filter = this.getByType(FilterType.SEARCH);

        if (filter) {
          this.removeFilter(filter); // search filter might occur once
        }

        if (search) {
          this.addFilter({ type: FilterType.SEARCH, value: search }, true);
        }
      }, {
        fireImmediately: true,
      }),
    ];

    return () => disposers.forEach(dispose => dispose());
  }

  @action
  addFilter(filter: Filter, begin = false) {
    if (begin) this.filters.unshift(filter);
    else {
      this.filters.push(filter);
    }
  }

  @action
  removeFilter(filter: Filter) {
    if (!this.filters.remove(filter)) {
      const filterCopy = this.filters.find(f => f.type === filter.type && f.value === filter.value);

      if (filterCopy) this.filters.remove(filterCopy);
    }
  }

  getByType(type: FilterType, value?: any): Filter | undefined {
    return this.filters.find(filter => filter.type === type && (
      arguments.length > 1 ? filter.value === value : true
    ));
  }

  getValues(type: FilterType) {
    return this.filters
      .filter(filter => filter.type === type)
      .map(filter => filter.value);
  }

  isEnabled(type: FilterType) {
    return !this.isDisabled.get(type);
  }

  @action
  disable(type: FilterType | FilterType[]) {
    [type].flat().forEach(type => this.isDisabled.set(type, true));

    return () => this.enable(type);
  }

  @action
  enable(type: FilterType | FilterType[]) {
    [type].flat().forEach(type => this.isDisabled.delete(type));

    return () => this.disable(type);
  }

  @action
  reset() {
    if (this.isEnabled(FilterType.SEARCH)) {
      this.dependencies.searchUrlParam.clear();
    }

    this.filters.length = 0;
    this.isDisabled.clear();
  }
}
