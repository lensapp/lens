/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToHelmReleasesInjectable from "../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RequestHelmReleaseConfiguration } from "../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import requestHelmReleaseConfigurationInjectable from "../../common/k8s-api/endpoints/helm-releases.api/request-configuration.injectable";
import type { RequestHelmReleaseUpdate } from "../../common/k8s-api/endpoints/helm-releases.api/request-update.injectable";
import requestHelmReleaseUpdateInjectable from "../../common/k8s-api/endpoints/helm-releases.api/request-update.injectable";
import type { RequestDetailedHelmRelease } from "../../renderer/components/helm-releases/release-details/release-details-model/request-detailed-helm-release.injectable";
import requestDetailedHelmReleaseInjectable from "../../renderer/components/helm-releases/release-details/release-details-model/request-detailed-helm-release.injectable";
import { showSuccessNotificationInjectable, showCheckedErrorNotificationInjectable } from "@k8slens/notifications";
import getRandomUpgradeChartTabIdInjectable from "../../renderer/components/dock/upgrade-chart/get-random-upgrade-chart-tab-id.injectable";
import type { RequestHelmCharts } from "../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";
import type { RequestHelmChartVersions } from "../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import type { RequestHelmChartReadme } from "../../common/k8s-api/endpoints/helm-charts.api/request-readme.injectable";
import type { RequestHelmChartValues } from "../../common/k8s-api/endpoints/helm-charts.api/request-values.injectable";
import requestHelmChartsInjectable from "../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";
import requestHelmChartVersionsInjectable from "../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import requestHelmChartReadmeInjectable from "../../common/k8s-api/endpoints/helm-charts.api/request-readme.injectable";
import requestHelmChartValuesInjectable from "../../common/k8s-api/endpoints/helm-charts.api/request-values.injectable";
import { HelmChart } from "../../common/k8s-api/endpoints/helm-charts.api";
import { testUsingFakeTime } from "../../test-utils/use-fake-time";
import type { ListClusterHelmReleases } from "../../main/helm/helm-service/list-helm-releases.injectable";
import listClusterHelmReleasesInjectable from "../../main/helm/helm-service/list-helm-releases.injectable";
import { anyObject } from "jest-mock-extended";
import { toHelmRelease } from "../../renderer/components/helm-releases/to-helm-release";

describe("showing details for helm release", () => {
  let builder: ApplicationBuilder;
  let requestDetailedHelmReleaseMock: AsyncFnMock<RequestDetailedHelmRelease>;
  let requestHelmReleaseConfigurationMock: AsyncFnMock<RequestHelmReleaseConfiguration>;
  let requestHelmReleaseUpdateMock: AsyncFnMock<RequestHelmReleaseUpdate>;
  let requestHelmChartsMock: AsyncFnMock<RequestHelmCharts>;
  let requestHelmChartVersionsMock: AsyncFnMock<RequestHelmChartVersions>;
  let requestHelmChartReadmeMock: AsyncFnMock<RequestHelmChartReadme>;
  let requestHelmChartValuesMock: AsyncFnMock<RequestHelmChartValues>;
  let showSuccessNotificationMock: jest.Mock;
  let showCheckedErrorNotificationMock: jest.Mock;
  let listClusterHelmReleasesMock: AsyncFnMock<ListClusterHelmReleases>;

  beforeEach(() => {
    testUsingFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    requestDetailedHelmReleaseMock = asyncFn();
    requestHelmReleaseConfigurationMock = asyncFn();
    requestHelmReleaseUpdateMock = asyncFn();
    requestHelmChartsMock = asyncFn();
    requestHelmChartVersionsMock = asyncFn();
    requestHelmChartReadmeMock = asyncFn();
    requestHelmChartValuesMock = asyncFn();

    showSuccessNotificationMock = jest.fn();
    showCheckedErrorNotificationMock = jest.fn();

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(getRandomUpgradeChartTabIdInjectable, () => () => "some-tab-id");
      windowDi.override(showSuccessNotificationInjectable, () => showSuccessNotificationMock);
      windowDi.override(showCheckedErrorNotificationInjectable, () => showCheckedErrorNotificationMock);
      windowDi.override(requestDetailedHelmReleaseInjectable, () => requestDetailedHelmReleaseMock);
      windowDi.override(requestHelmReleaseConfigurationInjectable, () => requestHelmReleaseConfigurationMock);
      windowDi.override(requestHelmReleaseUpdateInjectable, () => requestHelmReleaseUpdateMock);
      windowDi.override(requestHelmChartsInjectable, () => requestHelmChartsMock);
      windowDi.override(requestHelmChartVersionsInjectable, () => requestHelmChartVersionsMock);
      windowDi.override(requestHelmChartReadmeInjectable, () => requestHelmChartReadmeMock);
      windowDi.override(requestHelmChartValuesInjectable, () => requestHelmChartValuesMock);
    });

    builder.beforeApplicationStart(({ mainDi }) => {
      listClusterHelmReleasesMock = asyncFn();
      mainDi.override(listClusterHelmReleasesInjectable, () => listClusterHelmReleasesMock);
    });

    builder.namespaces.add("some-namespace");
    builder.namespaces.add("some-other-namespace");
    builder.namespaces.add("some-third-namespace");

    builder.afterWindowStart(() => {
      builder.namespaces.select("some-namespace");
      builder.namespaces.select("some-other-namespace");
    });
  });

  describe("given application is started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await builder.render();
    });

    describe("when navigating to helm releases", () => {
      beforeEach(() => {
        const windowDi = builder.applicationWindow.only.di;

        const navigateToHelmReleases = windowDi.inject(
          navigateToHelmReleasesInjectable,
        );

        navigateToHelmReleases();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("calls for releases for each selected namespace", () => {
        expect(listClusterHelmReleasesMock).toBeCalledTimes(2);
        expect(listClusterHelmReleasesMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }), "some-namespace");
        expect(listClusterHelmReleasesMock).toBeCalledWith(anyObject({ id: "some-cluster-id" }), "some-other-namespace");
      });

      it("shows spinner", () => {
        expect(
          rendered.getByTestId("helm-releases-spinner"),
        ).toBeInTheDocument();
      });

      it("when releases resolve but there is none, renders", async () => {
        await listClusterHelmReleasesMock.resolve({
          callWasSuccessful: true,
          response: [],
        });
        await listClusterHelmReleasesMock.resolve({
          callWasSuccessful: true,
          response: [],
        });

        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when releases resolve", () => {
        beforeEach(async () => {
          await listClusterHelmReleasesMock.resolveSpecific(
            ([, namespace]) => namespace === "some-namespace",
            {
              callWasSuccessful: true,
              response: [
                {
                  app_version: "some-app-version",
                  name: "some-name",
                  namespace: "some-namespace",
                  chart: "some-chart-1.0.0",
                  status: "some-status",
                  updated: "some-updated",
                  revision: "some-revision",
                },
              ],
            },
          );

          await listClusterHelmReleasesMock.resolveSpecific(
            ([, namespace]) => namespace === "some-other-namespace",
            {
              callWasSuccessful: true,
              response: [
                {
                  app_version: "some-other-app-version",
                  name: "some-other-name",
                  namespace: "some-other-namespace",
                  chart: "some-other-chart-2.0.0",
                  status: "some-other-status",
                  updated: "some-other-updated",
                  revision: "some-other-revision",
                },
              ],
            },
          );
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not show spinner anymore", () => {
          expect(
            rendered.queryByTestId("helm-releases-spinner"),
          ).not.toBeInTheDocument();
        });

        describe("when selecting release to see details", () => {
          beforeEach(() => {
            const row = rendered.getByTestId(
              "helm-release-row-for-some-namespace/some-name",
            );

            fireEvent.click(row);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("opens the details", () => {
            expect(
              rendered.getByTestId("helm-release-details-for-some-namespace/some-name"),
            ).toBeInTheDocument();
          });

          it("calls for release", () => {
            expect(requestDetailedHelmReleaseMock).toHaveBeenCalledWith({
              clusterId: "some-cluster-id",
              namespace: "some-namespace",
              releaseName: "some-name",
            });
          });

          it("shows spinner", () => {
            expect(
              rendered.getByTestId("helm-release-detail-content-spinner"),
            ).toBeInTheDocument();
          });

          describe("when opening details for second release", () => {
            beforeEach(() => {
              requestDetailedHelmReleaseMock.mockClear();

              const row = rendered.getByTestId(
                "helm-release-row-for-some-other-namespace/some-other-name",
              );

              fireEvent.click(row);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("calls for another release", () => {
              expect(requestDetailedHelmReleaseMock).toHaveBeenCalledWith({
                clusterId: "some-cluster-id",
                namespace: "some-other-namespace",
                releaseName: "some-other-name",
              });
            });

            it("closes details for first release", () => {
              expect(
                rendered.queryByTestId(
                  "helm-release-details-for-some-namespace/some-name",
                ),
              ).not.toBeInTheDocument();
            });

            it("opens details for second release", () => {
              expect(
                rendered.getByTestId(
                  "helm-release-details-for-some-other-namespace/some-other-name",
                ),
              ).toBeInTheDocument();
            });

            it("shows spinner", () => {
              expect(
                rendered.getByTestId("helm-release-detail-content-spinner"),
              ).toBeInTheDocument();
            });

            describe("when details for second release resolve", () => {
              beforeEach(async () => {
                await requestDetailedHelmReleaseMock.resolve({
                  callWasSuccessful: true,
                  response: {
                    release: toHelmRelease({
                      app_version: "some-app-version",
                      chart: "some-chart-1.0.0",
                      status: "some-status",
                      updated: "some-updated",
                      revision: "some-revision",
                      name: "some-other-name",
                      namespace: "some-other-namespace",
                    }),

                    details: {
                      name: "some-other-name",
                      namespace: "some-other-namespace",
                      version: 1,
                      config: {},
                      manifest: "some-manifest",

                      info: {
                        deleted: "some-deleted",
                        description: "some-description",
                        first_deployed: "some-first-deployed",
                        last_deployed: "some-last-deployed",
                        notes: "some-notes",
                        status: "some-status",
                      },

                      resources: [
                        {
                          kind: "some-kind",
                          apiVersion: "some-api-version",
                          metadata: {
                            uid: "some-uid",
                            name: "some-resource",
                            namespace: "some-namespace",
                            creationTimestamp: "2015-10-22T07:28:00Z",
                          },
                        },
                      ],
                    },
                  },
                });
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("calls for release configuration", () => {
                expect(
                  requestHelmReleaseConfigurationMock,
                ).toHaveBeenCalledWith("some-other-name", "some-other-namespace", true);
              });

              describe("when configuration resolves", () => {
                beforeEach(async () => {
                  await requestHelmReleaseConfigurationMock.resolve(
                    "some-other-configuration",
                  );
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });
              });
            });
          });

          describe("when details is closed", () => {
            beforeEach(() => {
              const closeButton = rendered.getByTestId(
                "close-helm-release-detail",
              );

              fireEvent.click(closeButton);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("closes the details", () => {
              expect(
                rendered.queryByTestId("helm-release-details-for-some-namespace/some-name"),
              ).not.toBeInTheDocument();
            });

            describe("when opening details for same release", () => {
              beforeEach(() => {
                requestDetailedHelmReleaseMock.mockClear();

                const row = rendered.getByTestId(
                  "helm-release-row-for-some-namespace/some-name",
                );

                fireEvent.click(row);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not reload", () => {
                expect(requestDetailedHelmReleaseMock).not.toHaveBeenCalled();
              });
            });
          });

          describe("when call for release resolves with error", () => {
            beforeEach(async () => {
              await requestDetailedHelmReleaseMock.resolve({
                callWasSuccessful: false,
                error: "some-error",
              });
            });

            it("renders", async () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("does not show spinner anymore", () => {
              expect(
                rendered.queryByTestId("helm-release-detail-content-spinner"),
              ).not.toBeInTheDocument();
            });

            it("shows error message about missing release", () => {
              expect(
                rendered.getByTestId("helm-release-detail-error"),
              ).toBeInTheDocument();
            });

            it("does not call for release configuration", () => {
              expect(requestHelmReleaseConfigurationMock).not.toHaveBeenCalled();
            });
          });

          describe("when call for release resolve with release", () => {
            beforeEach(async () => {
              await requestDetailedHelmReleaseMock.resolve({
                callWasSuccessful: true,
                response: {
                  release: toHelmRelease({
                    app_version: "some-app-version",
                    chart: "some-chart-1.0.0",
                    status: "some-status",
                    updated: "some-updated",
                    revision: "some-revision",
                    name: "some-name",
                    namespace: "some-namespace",
                  }),

                  details: {
                    name: "some-name",
                    namespace: "some-namespace",
                    version: 1,
                    config: {},
                    manifest: "some-manifest",

                    info: {
                      deleted: "some-deleted",
                      description: "some-description",
                      first_deployed: "some-first-deployed",
                      last_deployed: "some-last-deployed",
                      notes: "some-notes",
                      status: "some-status",
                    },

                    resources: [
                      {
                        kind: "some-kind",
                        apiVersion: "some-api-version",
                        metadata: {
                          uid: "some-uid",
                          name: "some-resource",
                          namespace: "some-namespace",
                          creationTimestamp: "2015-10-22T07:28:00Z",
                        },
                      },
                    ],
                  },
                },
              });
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("calls for release configuration", () => {
              expect(requestHelmReleaseConfigurationMock).toHaveBeenCalledWith(
                "some-name",
                "some-namespace",
                true,
              );
            });

            describe("when configuration resolves", () => {
              beforeEach(async () => {
                await requestHelmReleaseConfigurationMock.resolve(
                  "some-configuration",
                );
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not have tab for upgrading chart yet", () => {
                expect(
                  rendered.queryByTestId("dock-tab-for-some-tab-id"),
                ).not.toBeInTheDocument();
              });

              describe("when selecting to upgrade chart", () => {
                beforeEach(() => {
                  const upgradeButton = rendered.getByTestId(
                    "helm-release-upgrade-button",
                  );

                  fireEvent.click(upgradeButton);
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("opens tab for upgrading chart", () => {
                  expect(
                    rendered.getByTestId("dock-tab-for-some-tab-id"),
                  ).toBeInTheDocument();
                });

                it("closes the details", () => {
                  expect(
                    rendered.queryByTestId("helm-release-details-for-some-namespace/some-name"),
                  ).not.toBeInTheDocument();
                });
              });

              describe("when changing the configuration", () => {
                beforeEach(() => {
                  const configuration = rendered.getByTestId(
                    "monaco-editor-for-helm-release-configuration-some-namespace/some-name",
                  );

                  fireEvent.change(configuration, {
                    target: { value: "some-new-configuration" },
                  });
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("has the configuration", () => {
                  const input = rendered.getByTestId(
                    "monaco-editor-for-helm-release-configuration-some-namespace/some-name",
                  );

                  expect(input).toHaveValue("some-new-configuration");
                });

                it("does not save changes yet", () => {
                  expect(requestHelmReleaseUpdateMock).not.toHaveBeenCalled();
                });

                describe("when toggling to see only user defined values", () => {
                  beforeEach(() => {
                    requestHelmReleaseConfigurationMock.mockClear();

                    const toggle = rendered.getByTestId(
                      "user-supplied-values-only-checkbox",
                    );

                    fireEvent.click(toggle);
                  });

                  it("calls for only user defined configuration", () => {
                    expect(requestHelmReleaseConfigurationMock).toHaveBeenCalledWith(
                      "some-name",
                      "some-namespace",
                      false,
                    );
                  });

                  describe("when configuration resolves", () => {
                    beforeEach(async () => {
                      await requestHelmReleaseConfigurationMock.resolve(
                        "some-other-configuration",
                      );
                    });

                    it("renders", () => {
                      expect(rendered.baseElement).toMatchSnapshot();
                    });

                    it("overrides the user inputted configuration with new configuration", () => {
                      const input = rendered.getByTestId(
                        "monaco-editor-for-helm-release-configuration-some-namespace/some-name",
                      );

                      expect(input).toHaveValue("some-other-configuration");
                    });

                    it("when toggling again, calls for all configuration", () => {
                      requestHelmReleaseConfigurationMock.mockClear();

                      const toggle = rendered.getByTestId(
                        "user-supplied-values-only-checkbox",
                      );

                      fireEvent.click(toggle);

                      expect(requestHelmReleaseConfigurationMock).toHaveBeenCalledWith(
                        "some-name",
                        "some-namespace",
                        true,
                      );
                    });
                  });
                });

                describe("when saving", () => {
                  beforeEach(() => {
                    const saveButton = rendered.getByTestId(
                      "helm-release-configuration-save-button",
                    );

                    fireEvent.click(saveButton);
                  });

                  it("renders", () => {
                    expect(rendered.baseElement).toMatchSnapshot();
                  });

                  it("shows spinner", () => {
                    const saveButton = rendered.getByTestId(
                      "helm-release-configuration-save-button",
                    );

                    expect(saveButton).toHaveClass("waiting");
                  });

                  describe("when requestHelmCharts resolves", () => {
                    beforeEach(async () => {
                      await requestHelmChartsMock.resolve([HelmChart.create({
                        apiVersion: "1.2.3",
                        version: "1.0.0",
                        created: "at-some-time",
                        name: "some-chart",
                        repo: "some-repo",
                      })]);
                    });
                    describe("when requestHelmChartVersions resolves", () => {
                      beforeEach(async () => {
                        await requestHelmChartVersionsMock.resolve([HelmChart.create({
                          apiVersion: "1.2.3",
                          version: "1.0.0",
                          created: "at-some-time",
                          name: "some-chart",
                          repo: "some-repo",
                        })]);
                      });

                      it("calls for update", () => {
                        expect(requestHelmReleaseUpdateMock).toHaveBeenCalledWith(
                          "some-name",
                          "some-namespace",

                          {
                            chart: "some-chart",
                            repo: "some-repo",
                            values: "some-new-configuration",
                            version: "1.0.0",
                          },
                        );
                      });

                      describe("when update resolves with success", () => {
                        beforeEach(async () => {
                          listClusterHelmReleasesMock.mockClear();
                          requestHelmReleaseConfigurationMock.mockClear();

                          await requestHelmReleaseUpdateMock.resolve({
                            callWasSuccessful: true,
                          });
                        });

                        it("renders", () => {
                          expect(rendered.baseElement).toMatchSnapshot();
                        });

                        it("does not show spinner anymore", () => {
                          const saveButton = rendered.getByTestId(
                            "helm-release-configuration-save-button",
                          );

                          expect(saveButton).not.toHaveClass("waiting");
                        });

                        it("reloads the configuration", () => {
                          expect(requestHelmReleaseConfigurationMock).toHaveBeenCalledWith(
                            "some-name",
                            "some-namespace",
                            true,
                          );
                        });

                        it("shows success notification", () => {
                          expect(showSuccessNotificationMock).toHaveBeenCalled();
                        });

                        it("does not show error notification", () => {
                          expect(showCheckedErrorNotificationMock).not.toHaveBeenCalled();
                        });
                      });

                      describe("when update resolves with failure", () => {
                        beforeEach(async () => {
                          listClusterHelmReleasesMock.mockClear();
                          requestHelmReleaseConfigurationMock.mockClear();

                          await requestHelmReleaseUpdateMock.resolve({
                            callWasSuccessful: false,
                            error: "some-error",
                          });
                        });

                        it("renders", () => {
                          expect(rendered.baseElement).toMatchSnapshot();
                        });

                        it("does not show spinner anymore", () => {
                          const saveButton = rendered.getByTestId(
                            "helm-release-configuration-save-button",
                          );

                          expect(saveButton).not.toHaveClass("waiting");
                        });

                        it("does not reload the configuration", () => {
                          expect(requestHelmReleaseConfigurationMock).not.toHaveBeenCalled();
                        });

                        it("does not show success notification", () => {
                          expect(showSuccessNotificationMock).not.toHaveBeenCalled();
                        });

                        it("shows error notification", () => {
                          expect(showCheckedErrorNotificationMock).toHaveBeenCalled();
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
  });
});
