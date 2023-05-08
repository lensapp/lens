/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import { anyObject } from "jest-mock-extended";
import type { NavigateToHelmReleases } from "../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToHelmReleasesInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import type { RequestHelmCharts } from "../../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";
import requestHelmChartsInjectable from "../../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";
import type { RequestHelmChartVersions } from "../../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import requestHelmChartVersionsInjectable from "../../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import type { RequestHelmReleaseConfiguration } from "../../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import requestHelmReleaseConfigurationInjectable from "../../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import type { ListClusterHelmReleases } from "../../../main/helm/helm-service/list-helm-releases.injectable";
import listClusterHelmReleasesInjectable from "../../../main/helm/helm-service/list-helm-releases.injectable";
import dockStoreInjectable from "../../../renderer/components/dock/dock/store.injectable";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { testUsingFakeTime, advanceFakeTime } from "../../../test-utils/use-fake-time";

describe("New Upgrade Helm Chart Dock Tab", () => {
  let builder: ApplicationBuilder;
  let renderResult: RenderResult;
  let requestHelmReleaseConfigurationMock: AsyncFnMock<RequestHelmReleaseConfiguration>;
  let requestHelmChartsMock: AsyncFnMock<RequestHelmCharts>;
  let requestHelmChartVersionsMock: AsyncFnMock<RequestHelmChartVersions>;
  let listClusterHelmReleasesMock: AsyncFnMock<ListClusterHelmReleases>;
  let navigateToHelmReleases: NavigateToHelmReleases;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart(({ windowDi }) => {
      requestHelmReleaseConfigurationMock = asyncFn();
      windowDi.override(requestHelmReleaseConfigurationInjectable, () => requestHelmReleaseConfigurationMock);

      requestHelmChartsMock = asyncFn();
      windowDi.override(requestHelmChartsInjectable, () => requestHelmChartsMock);

      requestHelmChartVersionsMock = asyncFn();
      windowDi.override(requestHelmChartVersionsInjectable, () => requestHelmChartVersionsMock);

      navigateToHelmReleases = windowDi.inject(navigateToHelmReleasesInjectable);
    });

    builder.beforeApplicationStart(({ mainDi }) => {
      listClusterHelmReleasesMock = asyncFn();
      mainDi.override(listClusterHelmReleasesInjectable, () => listClusterHelmReleasesMock);
    });

    testUsingFakeTime("2020-01-12 12:00:00");

    builder.namespaces.add("my-first-namespace");
    builder.namespaces.add("my-second-namespace");

    renderResult = await builder.render();

    const dockStore = builder.applicationWindow.only.di.inject(dockStoreInjectable);

    // TODO: Make TerminalWindow unit testable to allow realistic behaviour
    dockStore.closeTab("terminal");
  });

  describe("given a namespace is selected", () => {
    beforeEach(() => {
      builder.namespaces.select("my-second-namespace");
    });

    describe("when navigating to the helm releases view", () => {
      beforeEach(() => {
        navigateToHelmReleases();
      });

      it("renders", () => {
        expect(renderResult.baseElement).toMatchSnapshot();
      });

      it("requests helm releases for the selected namespace", () => {
        expect(listClusterHelmReleasesMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }), "my-second-namespace");
      });

      describe("when helm releases resolves", () => {
        beforeEach(async () => {
          await listClusterHelmReleasesMock.resolve({
            callWasSuccessful: true,
            response: [
              {
                app_version: "some-app-version",
                name: "some-name",
                namespace: "my-second-namespace",
                chart: "some-chart-1.0.0",
                status: "some-status",
                updated: "some-updated",
                revision: "some-revision",
              },
            ],
          });
        });

        it("renders", () => {
          expect(renderResult.baseElement).toMatchSnapshot();
        });

        describe("when clicking the menu for a helm release", () => {
          beforeEach(() => {
            const helmReleaseMenu = renderResult.getByTestId("menu-actions-icon-for-release-menu-for-my-second-namespace/some-name");

            helmReleaseMenu.click();
          });

          it("renders", () => {
            expect(renderResult.baseElement).toMatchSnapshot();
          });

          describe("when clicking the upgrade chart menu item", () => {
            beforeEach(() => {
              const upgradeHelmChartMenuItem = renderResult.getByTestId("upgrade-chart-menu-item-for-my-second-namespace/some-name");

              upgradeHelmChartMenuItem.click();
              advanceFakeTime(100);
            });

            it("renders", () => {
              expect(renderResult.baseElement).toMatchSnapshot();
            });

            it("requests all helm charts", () => {
              expect(requestHelmChartsMock).toBeCalled();
            });

            describe("when request for all helm charts resolves", () => {
              beforeEach(async () => {
                await requestHelmChartsMock.resolve([
                  HelmChart.create({
                    apiVersion: "1.2.3",
                    version: "1.0.0",
                    created: "at-some-time",
                    name: "some-chart",
                    repo: "some-repo",
                  }),
                  HelmChart.create({
                    apiVersion: "1.2.3",
                    version: "1.0.0",
                    created: "at-some-third-time",
                    name: "some-chart",
                    repo: "some-third-repo",
                  }),
                  HelmChart.create({
                    apiVersion: "1.2.3",
                    version: "0.9.0",
                    created: "at-some-other-time",
                    name: "some-other-chart",
                    repo: "some-repo",
                  }),
                ]);
              });

              it("requests versions of the helm charts", () => {
                expect(requestHelmChartVersionsMock).toBeCalledWith(
                  "some-repo",
                  "some-chart",
                );
                expect(requestHelmChartVersionsMock).toBeCalledWith(
                  "some-third-repo",
                  "some-chart",
                );
              });

              it("shows the dock tab of the upgrade chart tab", () => {
                expect(renderResult.queryByTestId("dock-tab-content-for-some-irrelevant-random-id")).toBeInTheDocument();
              });

              it("does not yet show the dock contents of the upgrade chart tab", () => {
                expect(renderResult.queryByTestId("upgrade-chart-dock-tab-contents-for-my-second-namespace/some-name")).not.toBeInTheDocument();
              });

              describe("when the requests of versions of the helm charts resolves", () => {
                beforeEach(async () => {
                  await requestHelmChartVersionsMock.resolveSpecific(
                    ["some-repo", "some-chart"],
                    [
                      HelmChart.create({
                        apiVersion: "1.2.3",
                        version: "1.0.0",
                        created: "at-some-time",
                        name: "some-chart",
                        repo: "some-repo",
                      }),
                      HelmChart.create({
                        apiVersion: "1.2.3",
                        version: "1.0.1",
                        created: "at-some-time",
                        name: "some-chart",
                        repo: "some-repo",
                      }),
                    ],
                  );

                  await requestHelmChartVersionsMock.resolveSpecific(
                    ["some-third-repo", "some-chart"],
                    [
                      HelmChart.create({
                        apiVersion: "1.2.3",
                        version: "0.9.0",
                        created: "at-some-other-time",
                        name: "some-other-chart",
                        repo: "some-repo",
                      }),
                      HelmChart.create({
                        apiVersion: "1.2.3",
                        version: "0.9.1",
                        created: "at-some-other-time",
                        name: "some-other-chart",
                        repo: "some-repo",
                      }),
                    ],
                  );
                });

                it("renders", () => {
                  expect(renderResult.baseElement).toMatchSnapshot();
                });

                it("shows the dock contents of the upgrade chart tab", () => {
                  expect(renderResult.queryByTestId("upgrade-chart-dock-tab-contents-for-my-second-namespace/some-name")).toBeInTheDocument();
                });

                it("requests the configuration for the specific helm release", () => {
                  expect(requestHelmReleaseConfigurationMock).toBeCalledWith(
                    "some-name",
                    "my-second-namespace",
                    true,
                  );
                });

                describe("when the configuration request resolves", () => {
                  beforeEach(async () => {
                    await requestHelmReleaseConfigurationMock.resolve("some confiration for the helm release");
                  });

                  it("renders", () => {
                    expect(renderResult.baseElement).toMatchSnapshot();
                  });

                  describe("when closing the upgrade chart tab", () => {
                    beforeEach(() => {
                      const closeDockTab = renderResult.getByTestId("dock-tab-close-for-some-irrelevant-random-id");

                      closeDockTab.click();
                    });

                    it("renders", () => {
                      expect(renderResult.baseElement).toMatchSnapshot();
                    });

                    it("does so", () => {
                      expect(renderResult.queryByTestId("dock-tab-content-for-some-irrelevant-random-id")).not.toBeInTheDocument();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
