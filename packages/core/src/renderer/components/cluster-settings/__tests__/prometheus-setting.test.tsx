/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ClusterPrometheusSetting } from "../prometheus-setting";
import type { DiRender } from "@k8slens/test-utils";
import { renderFor } from "../../test-utils/renderFor";
import { Cluster } from "../../../../common/cluster/cluster";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import fetchInjectable from "../../../../common/fetch/fetch.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import type { Fetch } from "../../../../common/fetch/fetch.injectable";
import asyncFn from "@async-fn/jest";
import { testUsingFakeTime } from "../../../../test-utils/use-fake-time";
import requestMetricsProvidersInjectable from "../../../../common/k8s-api/endpoints/metrics.api/request-providers.injectable";
import type { MetricProviderInfo } from "../../../../common/k8s-api/endpoints/metrics.api/request-providers.injectable";
import getPrometheusDetailsRouteInjectable from "../get-prometheus-details.injectable";
import type { PrometheusDetailsData } from "../../../../common/k8s-api/endpoints/metrics.api/prometheus-details.channel";

const cluster = new Cluster({
  contextName: "some-context-name",
  id: "some-cluster-id",
  kubeConfigPath: "/some/path",
  preferences: {
    terminalCWD: "/foobar",
    defaultNamespace: "kube-system",
  },
});

describe("prometheus-settings", () => {
  let fetchMock: AsyncFnMock<Fetch>;
  let render: DiRender;
  let getPrometheusDetailsMock: jest.Mock;


  beforeEach(async () => {
    testUsingFakeTime("2015-10-21T07:28:00Z");

    const di = getDiForUnitTesting();

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);
    const metricProviders: MetricProviderInfo[] = [{
      name: "some-name",
      id: "some-id",
      isConfigurable: true,
    }];

    getPrometheusDetailsMock = jest.fn();

    di.override(requestMetricsProvidersInjectable, () => () => Promise.resolve(metricProviders));
    di.override(getPrometheusDetailsRouteInjectable, () => getPrometheusDetailsMock);

    const prometheusDetails: PrometheusDetailsData = {
      prometheusPath: "some/path:42",
      provider: {
        name: "some-name",
        kind: "some-kind",
        isConfigurable: true,
      },
    };

    getPrometheusDetailsMock.mockImplementation(() => Promise.resolve(prometheusDetails));
    render = renderFor(di);
  });

  it("should render prometheus settings", async () => {
    const dom = render(<ClusterPrometheusSetting cluster={cluster}/>);

    const title = await dom.findByTestId("prometheus-title");

    expect(title).toHaveTextContent("Prometheus");
  });

  it("given auto detected prometheus, renders prometheus provider details", async () => {
    const dom = render(<ClusterPrometheusSetting cluster={cluster}/>);

    const autoDetectSection = await dom.findByTestId("auto-detected-prometheus-details");

    expect(autoDetectSection).toBeDefined();
    const autoDetectProvider = await dom.findByTestId("auto-detected-prometheus-details-provider");
    const autoDetectPath = await dom.findByTestId("auto-detected-prometheus-details-path");

    expect(autoDetectProvider).toHaveTextContent("Provider:some-name");
    expect(autoDetectPath).toHaveTextContent("Path:some/path:42");
  });

  it("given no auto detected prometheus, renders prometheus notification", async () => {
    getPrometheusDetailsMock.mockImplementation(() => Promise.reject(new Error("some-error")));

    const dom = render(<ClusterPrometheusSetting cluster={cluster}/>);

    const noAutoDetectSection = await dom.findByTestId("no-auto-detected-prometheus-provider");
    const infoText = await dom.findByTestId("no-auto-detected-prometheus-info");

    expect(noAutoDetectSection).toBeDefined();
    expect(infoText).toHaveTextContent("Could not detect any Prometheus provider.");
  });

  it("given no auto detection selected, does not render auto detect section", async () => {
    const clusterWithProviderPreferences = new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some/path",
      preferences: {
        terminalCWD: "/foobar",
        defaultNamespace: "kube-system",
        prometheusProvider: {
          type: "some-id",
        },
        prometheus: {
          namespace: "some-namespace",
          port: 42,
          prefix: "some-prefix",
          service: "some-service",
        },
      },
    });
    const dom = render(<ClusterPrometheusSetting cluster={clusterWithProviderPreferences}/>);

    await dom.findByTestId("prometheus-title");
    const selectedProvider = dom.container.getElementsByClassName("Select__single-value")[0];
    const autoDetectSection = dom.queryByTestId("auto-detected-prometheus-details");
    const editSection = dom.queryByTestId("edit-prometheus-path-section");

    expect(selectedProvider).toHaveTextContent("some-name");
    expect(autoDetectSection).toBeFalsy();
    expect(editSection).toBeDefined();
  });

});
