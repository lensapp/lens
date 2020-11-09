import "./helm-charts.scss";

import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { helmChartsURL, IHelmChartsRouteParams } from "./helm-charts.route";
import { helmChartStore } from "./helm-chart.store";
import { HelmChart } from "../../api/endpoints/helm-charts.api";
import { HelmChartDetails } from "./helm-chart-details";
import { navigation } from "../../navigation";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { SearchInputUrl } from "../input";

enum sortBy {
  name = "name",
  repo = "repo",
}

interface Props extends RouteComponentProps<IHelmChartsRouteParams> {
}

@observer
export class HelmCharts extends Component<Props> {
  componentDidMount() {
    helmChartStore.loadAll();
  }

  get selectedChart() {
    const { match: { params: { chartName, repo } } } = this.props
    return helmChartStore.getByName(chartName, repo);
  }

  showDetails = (chart: HelmChart) => {
    if (!chart) {
      navigation.merge(helmChartsURL())
    }
    else {
      navigation.merge(helmChartsURL({
        params: {
          chartName: chart.getName(),
          repo: chart.getRepository(),
        }
      }))
    }
  }

  hideDetails = () => {
    this.showDetails(null);
  }

  render() {
    return (
      <>
        <ItemListLayout
          className="HelmCharts"
          store={helmChartStore}
          isClusterScoped={true}
          isSelectable={false}
          sortingCallbacks={{
            [sortBy.name]: (chart: HelmChart) => chart.getName(),
            [sortBy.repo]: (chart: HelmChart) => chart.getRepository(),
          }}
          searchFilters={[
            (chart: HelmChart) => chart.getName(),
            (chart: HelmChart) => chart.getVersion(),
            (chart: HelmChart) => chart.getAppVersion(),
            (chart: HelmChart) => chart.getKeywords(),
          ]}
          filterItems={[
            (items: HelmChart[]) => items.filter(item => !item.deprecated)
          ]}
          customizeHeader={() => (
            <SearchInputUrl placeholder={_i18n._(t`Search Helm Charts`)} />
          )}
          renderTableHeader={[
            { className: "icon" },
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Description</Trans>, className: "description" },
            { title: <Trans>Version</Trans>, className: "version" },
            { title: <Trans>App Version</Trans>, className: "app-version" },
            { title: <Trans>Repository</Trans>, className: "repository", sortBy: sortBy.repo },

          ]}
          renderTableContents={(chart: HelmChart) => [
            <figure>
              <img
                src={chart.getIcon() || require("./helm-placeholder.svg")}
                onLoad={evt => evt.currentTarget.classList.add("visible")}
              />
            </figure>,
            chart.getName(),
            chart.getDescription(),
            chart.getVersion(),
            chart.getAppVersion(),
            { title: chart.getRepository(), className: chart.getRepository().toLowerCase() }
          ]}
          detailsItem={this.selectedChart}
          onDetails={this.showDetails}
        />
        {this.selectedChart && (
          <HelmChartDetails
            chart={this.selectedChart}
            hideDetails={this.hideDetails}
          />
        )}
      </>
    );
  }
}
