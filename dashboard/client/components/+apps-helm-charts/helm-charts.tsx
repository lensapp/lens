import "./helm-charts.scss";

import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { helmChartsURL, HelmChartsRouteParams } from "./helm-charts.route";
import { helmChartStore } from "./helm-chart.store";
import { HelmChart } from "../../api/endpoints/helm-charts.api";
import { HelmChartDetails } from "./helm-chart-details";
import { navigation } from "../../navigation";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { SearchInput } from "../input";

enum sortBy {
  name = "name",
  repo = "repo",
}

interface Props extends RouteComponentProps<HelmChartsRouteParams> {
}

@observer
export class HelmCharts extends Component<Props> {
  componentDidMount(): void {
    helmChartStore.loadAll();
  }

  get selectedChart(): HelmChart {
    const { match: { params: { chartName, repo } } } = this.props;
    return helmChartStore.getByName(chartName, repo);
  }

  showDetails = (chart: HelmChart): void => {
    if (!chart) {
      navigation.merge(helmChartsURL());
    } else {
      navigation.merge(helmChartsURL({
        params: {
          chartName: chart.getName(),
          repo: chart.repo,
        }
      }));
    }
  }

  hideDetails = (): void => {
    this.showDetails(null);
  }

  render(): JSX.Element {
    return (
      <>
        <ItemListLayout
          className="HelmCharts"
          store={helmChartStore}
          isClusterScoped={true}
          isSelectable={false}
          sortingCallbacks={{
            [sortBy.name]: (chart: HelmChart): string => chart.getName(),
            [sortBy.repo]: ({repo}: HelmChart): string => repo,
          }}
          searchFilters={[
            (chart: HelmChart): string => chart.getName(),
            ({ version }: HelmChart): string => version,
            (chart: HelmChart): string => chart.getAppVersion(),
            ({ keywords }: HelmChart): string[] => keywords,
          ]}
          filterItems={[
            (items: HelmChart[]): HelmChart[] => items.filter(item => !item.deprecated)
          ]}
          customizeHeader={(): JSX.Element => (
            <SearchInput placeholder={_i18n._(t`Search Helm Charts`)}/>
          )}
          renderTableHeader={[
            { className: "icon" },
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Description</Trans>, className: "description" },
            { title: <Trans>Version</Trans>, className: "version" },
            { title: <Trans>App Version</Trans>, className: "app-version" },
            { title: <Trans>Repository</Trans>, className: "repository", sortBy: sortBy.repo },

          ]}
          renderTableContents={(chart: HelmChart): (HTMLElement | string | React.ReactNode)[] => [
            <figure key="placeholder-img">
              <img
                src={chart.icon || require("./helm-placeholder.svg")}
                onLoad={(evt): void => evt.currentTarget.classList.add("visible")}
              />
            </figure>,
            chart.getName(),
            chart.description,
            chart.version,
            chart.getAppVersion(),
            { title: chart.repo, className: chart.repo.toLowerCase() }
          ]}
          detailsItem={this.selectedChart}
          onDetails={this.showDetails}
        />
        <HelmChartDetails
          chart={this.selectedChart}
          hideDetails={this.hideDetails}
        />
      </>
    );
  }
}