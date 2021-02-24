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
import { SearchInputUrl } from "../input";

enum columnId {
  name = "name",
  description = "description",
  version = "version",
  appVersion = "app-version",
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
    const { match: { params: { chartName, repo } } } = this.props;

    return helmChartStore.getByName(chartName, repo);
  }

  showDetails = (chart: HelmChart) => {
    if (!chart) {
      navigation.merge(helmChartsURL());
    }
    else {
      navigation.merge(helmChartsURL({
        params: {
          chartName: chart.getName(),
          repo: chart.getRepository(),
        }
      }));
    }
  };

  hideDetails = () => {
    this.showDetails(null);
  };

  render() {
    return (
      <>
        <ItemListLayout
          isConfigurable
          tableId="helm_charts"
          className="HelmCharts"
          store={helmChartStore}
          isClusterScoped={true}
          isSelectable={false}
          sortingCallbacks={{
            [columnId.name]: (chart: HelmChart) => chart.getName(),
            [columnId.repo]: (chart: HelmChart) => chart.getRepository(),
          }}
          searchFilters={[
            (chart: HelmChart) => chart.getName(),
            (chart: HelmChart) => chart.getVersion(),
            (chart: HelmChart) => chart.getAppVersion(),
            (chart: HelmChart) => chart.getKeywords(),
          ]}
          customizeHeader={() => (
            <SearchInputUrl placeholder="Search Helm Charts" />
          )}
          renderTableHeader={[
            { className: "icon", showWithColumn: columnId.name },
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { title: "Description", className: "description", id: columnId.description },
            { title: "Version", className: "version", id: columnId.version },
            { title: "App Version", className: "app-version", id: columnId.appVersion },
            { title: "Repository", className: "repository", sortBy: columnId.repo, id: columnId.repo },
          ]}
          renderTableContents={(chart: HelmChart) => [
            <figure key="image">
              <img
                src={chart.getIcon() || require("./helm-placeholder.svg")}
                onLoad={evt => evt.currentTarget.classList.add("visible")}
              />
            </figure>,
            chart.getName(),
            chart.getDescription(),
            chart.getVersion(),
            chart.getAppVersion(),
            { title: chart.getRepository(), className: chart.getRepository().toLowerCase() },
            { className: "menu" }
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
