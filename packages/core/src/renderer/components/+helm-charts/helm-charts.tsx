/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./helm-charts.scss";

import React, { Component } from "react";
import { observer } from "mobx-react";
import type { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { HelmChartDetails } from "./helm-chart-details";
import { ItemListLayout } from "../item-object-list/list-layout";
import type { IComputedValue } from "mobx";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import helmChartsRouteParametersInjectable from "./helm-charts-route-parameters.injectable";
import type { NavigateToHelmCharts } from "../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";
import navigateToHelmChartsInjectable from "../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";
import { HelmChartIcon } from "./icon";
import helmChartsInjectable from "./helm-charts/helm-charts.injectable";
import selectedHelmChartInjectable from "./helm-charts/selected-helm-chart.injectable";
import { noop } from "lodash";

enum columnId {
  name = "name",
  description = "description",
  version = "version",
  appVersion = "app-version",
  repo = "repo",
}

interface Dependencies {
  routeParameters: {
    chartName: IComputedValue<string>;
    repo: IComputedValue<string>;
  };
  navigateToHelmCharts: NavigateToHelmCharts;
  charts: IAsyncComputed<HelmChart[]>;
  selectedChart: IComputedValue<HelmChart | undefined>;
}

@observer
class NonInjectedHelmCharts extends Component<Dependencies> {
  onDetails = (chart: HelmChart) => {
    if (chart === this.props.selectedChart.get()) {
      this.hideDetails();
    } else {
      this.showDetails(chart);
    }
  };

  showDetails = (chart: HelmChart | null) => {
    if (!chart) {
      this.props.navigateToHelmCharts();
    }
    else {
      this.props.navigateToHelmCharts({
        chartName: chart.getName(),
        repo: chart.getRepository(),
      });
    }
  };

  hideDetails = () => {
    this.showDetails(null);
  };

  render() {
    const { charts } = this.props;
    const selectedChart = this.props.selectedChart.get();

    return (
      <SiblingsInTabLayout>
        <div data-testid="page-for-helm-charts" style={{ display: "none" }}/>

        <ItemListLayout<HelmChart, false>
          isConfigurable
          tableId="helm_charts"
          className="HelmCharts"
          store={{
            get isLoaded() {
              return !charts.pending.get();
            },
            failedLoading: false,
            getTotalCount: () => charts.value.get().length,
            isSelected: (item) => item === selectedChart,
            toggleSelection: noop,
            isSelectedAll: () => false,
            toggleSelectionAll: () => false,
            pickOnlySelected: () => [],
            removeSelectedItems: async () => {},
          }}
          preloadStores={false}
          getItems={() => this.props.charts.value.get()}
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
          customizeTableRowProps={(item) => ({ testId: `helm-chart-row-for-${item.getFullName("-")}` })}
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
              <HelmChartIcon imageUrl={chart.getIcon()} />
            </figure>,
            chart.getName(),
            chart.getDescription(),
            chart.getVersion(),
            chart.getAppVersion(),
            { title: chart.getRepository(), className: chart.getRepository().toLowerCase() },
            { className: "menu" },
          ]}
          detailsItem={selectedChart}
          onDetails={this.onDetails}
        />
        {selectedChart && (
          <HelmChartDetails
            chart={selectedChart}
            hideDetails={this.hideDetails}
          />
        )}
      </SiblingsInTabLayout>
    );
  }
}

export const HelmCharts = withInjectables<Dependencies>(NonInjectedHelmCharts, {
  getProps: (di) => ({
    routeParameters: di.inject(helmChartsRouteParametersInjectable),
    navigateToHelmCharts: di.inject(navigateToHelmChartsInjectable),
    charts: di.inject(helmChartsInjectable),
    selectedChart: di.inject(selectedHelmChartInjectable),
  }),
});

