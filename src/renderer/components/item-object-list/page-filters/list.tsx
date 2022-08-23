/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./list.scss";
import React from "react";
import { observer } from "mobx-react";
import { Badge } from "../../badge";
import { cssNames } from "../../../utils";
import type { Filter, PageFiltersStore } from "./store";
import { FilterIcon } from "../filter-icon";
import { Icon } from "../../icon";
import type { PageParam } from "../../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import pageFiltersStoreInjectable from "./store.injectable";
import searchUrlPageParamInjectable from "../../input/search-url-page-param.injectable";

export interface PageFiltersListProps {
  filters?: Filter[];
}

interface Dependencies {
  pageFiltersStore: PageFiltersStore;
  searchUrlParam: PageParam<string>;
}

const NonInjectedPageFiltersList = observer(({
  pageFiltersStore,
  searchUrlParam,
  filters: rawFilters,
}: Dependencies & PageFiltersListProps) => {
  const filters = rawFilters ?? pageFiltersStore.activeFilters;

  const reset = () => pageFiltersStore.reset();
  const remove = (filter: Filter) => {
    pageFiltersStore.removeFilter(filter);
    searchUrlParam.clear();
  };

  const renderContent = () => {
    if (filters.length === 0) {
      return null;
    }

    return (
      <>
        <div className="header flex gaps">
          <span>Currently applied filters:</span>
          <a onClick={reset} className="reset">
            Reset
          </a>
        </div>
        <div className="labels">
          {filters.map(filter => {
            const { value, type } = filter;

            return (
              <Badge
                key={`${type}-${value}`}
                title={type}
                className={cssNames("Badge flex gaps filter align-center", type)}
                label={(
                  <>
                    <FilterIcon type={type}/>
                    <span className="value">{value}</span>
                    <Icon
                      small
                      material="close"
                      onClick={() => remove(filter)}
                    />
                  </>
                )}
              />
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="PageFiltersList">
      {renderContent()}
    </div>
  );
});

export const PageFiltersList = withInjectables<Dependencies, PageFiltersListProps>(NonInjectedPageFiltersList, {
  getProps: (di, props) => ({
    ...props,
    pageFiltersStore: di.inject(pageFiltersStoreInjectable),
    searchUrlParam: di.inject(searchUrlPageParamInjectable),
  }),
});
