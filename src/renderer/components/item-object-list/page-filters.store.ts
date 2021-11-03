/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { computed, observable, reaction, makeObservable, action } from "mobx";
import { autoBind } from "../../utils";
import { searchUrlParam } from "../input/search-input-url";

export enum FilterType {
  SEARCH = "search",
}

export interface Filter {
  type: FilterType;
  value: string;
}

export class PageFiltersStore {
  protected filters = observable.array<Filter>([], { deep: false });
  protected isDisabled = observable.map<FilterType, boolean>();

  @computed get activeFilters() {
    return this.filters.filter(filter => !this.isDisabled.get(filter.type));
  }

  constructor() {
    makeObservable(this);
    autoBind(this);

    this.syncWithGlobalSearch();
  }

  protected syncWithGlobalSearch() {
    const disposers = [
      reaction(() => this.getValues(FilterType.SEARCH)[0], search => searchUrlParam.set(search)),
      reaction(() => searchUrlParam.get(), search => {
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

  getByType(type: FilterType, value?: any): Filter {
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
      searchUrlParam.clear();
    }

    this.filters.length = 0;
    this.isDisabled.clear();
  }
}

export const pageFilters = new PageFiltersStore();
