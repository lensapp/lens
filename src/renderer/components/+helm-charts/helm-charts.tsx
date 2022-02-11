/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./helm-charts.scss";

import React, { Component } from "react";
import type { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { helmChartStore } from "./helm-chart.store";
import type { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { HelmChartDetails } from "./helm-chart-details";
import { navigation } from "../../navigation";
import { ItemListLayout } from "../item-object-list/list-layout";
import { helmChartsURL } from "../../../common/routes";
import type { HelmChartsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  description = "description",
  version = "version",
  appVersion = "app-version",
  repo = "repo",
}

interface Props extends RouteComponentProps<HelmChartsRouteParams> {
}

@observer
export class HelmCharts extends Component<Props> {
  componentDidMount() {
    helmChartStore.loadAll();
  }

  get selectedChart() {
    const { match: { params: { chartName, repo }}} = this.props;

    return helmChartStore.getByName(chartName, repo);
  }

  onDetails = (chart: HelmChart) => {
    if (chart === this.selectedChart) {
      this.hideDetails();
    } else {
      this.showDetails(chart);
    }
  };

  showDetails = (chart: HelmChart) => {
    if (!chart) {
      navigation.push(helmChartsURL());
    }
    else {
      navigation.push(helmChartsURL({
        params: {
          chartName: chart.getName(),
          repo: chart.getRepository(),
        },
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
          getItems={() => helmChartStore.items}
          isSelectable={false}
          sortingCallbacks={{
            [columnId.name]: chart => chart.getName(),
            [columnId.repo]: chart => chart.getRepository(),
          }}
          searchFilters={[
            chart => chart.getName(),
            chart => chart.getVersion(),
            chart => chart.getAppVersion(),
            chart => chart.getKeywords(),
          ]}
          customizeHeader={({ searchProps }) => ({
            searchProps: {
              ...searchProps,
              placeholder: "Search Helm Charts...",
            },
          })}
          renderTableHeader={[
            { className: "icon", showWithColumn: columnId.name },
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { title: "Description", className: "description", id: columnId.description },
            { title: "Version", className: "version", id: columnId.version },
            { title: "App Version", className: "app-version", id: columnId.appVersion },
            { title: "Repository", className: "repository", sortBy: columnId.repo, id: columnId.repo },
          ]}
          renderTableContents={chart => [
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
            { className: "menu" },
          ]}
          detailsItem={this.selectedChart}
          onDetails={this.onDetails}
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
