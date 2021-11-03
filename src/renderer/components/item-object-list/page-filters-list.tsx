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

import "./page-filters-list.scss";
import React from "react";
import { observer } from "mobx-react";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { Filter, pageFilters } from "./page-filters.store";
import { FilterIcon } from "./filter-icon";
import { Icon } from "../icon";
import { searchUrlParam } from "../input";

interface Props {
  filters?: Filter[];
}

@observer
export class PageFiltersList extends React.Component<Props> {
  static defaultProps: Props = {
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
    const { filters } = this.props;

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
