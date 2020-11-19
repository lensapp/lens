import "./page-filters-list.scss";
import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Badge } from "../badge";
import { cssNames } from "../../utils";
import { Filter, pageFilters } from "./page-filters.store";
import { FilterIcon } from "./filter-icon";
import { Icon } from "../icon";

interface Props {
  filters?: Filter[];
}

@observer
export class PageFiltersList extends React.Component<Props> {
  static defaultProps: Props = {
    get filters() {
      return pageFilters.activeFilters;
    }
  };

  reset = () => pageFilters.reset();
  remove = (filter: Filter) => pageFilters.removeFilter(filter);

  renderContent() {
    const { filters } = this.props;
    if (!filters.length) {
      return null;
    }
    return (
      <>
        <div className="header flex gaps">
          <span><Trans>Currently applied filters:</Trans></span>
          <a onClick={this.reset} className="reset">
            <Trans>Reset</Trans>
          </a>
        </div>
        <div className="labels">
          {filters.map(filter => {
            const { value, type } = filter;
            return (
              <Badge
                key={`${type}-${value}`}
                title={type}
                className={cssNames("flex gaps filter align-center", type)}
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
