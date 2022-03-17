/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./page-filters-list.scss";
import React from "react";
import { observer } from "mobx-react";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import type { Filter } from "./page-filters.store";
import { pageFilters } from "./page-filters.store";
import { FilterIcon } from "./filter-icon";
import { Icon } from "../icon";
import { searchUrlParam } from "../input";

export interface PageFiltersListProps {
  filters?: Filter[];
}

@observer
export class PageFiltersList extends React.Component<PageFiltersListProps> {
  static defaultProps: PageFiltersListProps = {
    get filters() {
      return pageFilters.activeFilters;
    },
  };

  reset = () => pageFilters.reset();
  remove = (filter: Filter) => {
    pageFilters.removeFilter(filter);
    searchUrlParam.clear();
  };

  renderContent() {
    const { filters = [] } = this.props;

    if (!filters.length) {
      return null;
    }

    return (
      <>
        <div className="header flex gaps">
          <span>Currently applied filters:</span>
          <a onClick={this.reset} className="reset">
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
                      onClick={() => this.remove(filter)}
                    />
                  </>
                )}
              />
            );
          })}
        </div>
      </>
    );
  }

  render() {
    return (
      <div className="PageFiltersList">
        {this.renderContent()}
      </div>
    );
  }
}
