/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import type { CallForHelmCharts } from "../../../renderer/components/+helm-charts/helm-charts/call-for-helm-charts.injectable";
import callForHelmChartsInjectable from "../../../renderer/components/+helm-charts/helm-charts/call-for-helm-charts.injectable";
import { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import getRandomInstallChartTabIdInjectable from "../../../renderer/components/dock/install-chart/get-random-install-chart-tab-id.injectable";
import type { CallForHelmChartValues } from "../../../renderer/components/dock/install-chart/chart-data/call-for-helm-chart-values.injectable";
import callForHelmChartValuesInjectable from "../../../renderer/components/dock/install-chart/chart-data/call-for-helm-chart-values.injectable";
import type { CallForCreateHelmRelease } from "../../../renderer/components/+helm-releases/create-release/call-for-create-helm-release.injectable";
import callForCreateHelmReleaseInjectable from "../../../renderer/components/+helm-releases/create-release/call-for-create-helm-release.injectable";
import currentPathInjectable from "../../../renderer/routes/current-path.injectable";
import namespaceStoreInjectable from "../../../renderer/components/+namespaces/store.injectable";
import type { NamespaceStore } from "../../../renderer/components/+namespaces/store";
import type { CallForHelmChartReadme } from "../../../renderer/components/+helm-charts/details/readme/call-for-helm-chart-readme.injectable";
import callForHelmChartReadmeInjectable from "../../../renderer/components/+helm-charts/details/readme/call-for-helm-chart-readme.injectable";
import type { CallForHelmChartVersions } from "../../../renderer/components/+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import callForHelmChartVersionsInjectable from "../../../renderer/components/+helm-charts/details/versions/call-for-helm-chart-versions.injectable";
import { overrideFsWithFakes } from "../../../test-utils/override-fs-with-fakes";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import dockStoreInjectable from "../../../renderer/components/dock/dock/store.injectable";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import type { DiContainer } from "@ogre-tools/injectable";

// TODO: Make tooltips free of side effects by making it deterministic
jest.mock("../../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip: (target: any) => target,
}));

describe("installing helm chart from new tab", () => {
  let builder: ApplicationBuilder;
  let rendererDi: DiContainer;
  let callForHelmChartsMock: AsyncFnMock<CallForHelmCharts>;
  let callForHelmChartVersionsMock: AsyncFnMock<CallForHelmChartVersions>;
  let callForHelmChartReadmeMock: AsyncFnMock<CallForHelmChartReadme>;
  let callForHelmChartValuesMock: AsyncFnMock<CallForHelmChartValues>;
  let callForCreateHelmReleaseMock: AsyncFnMock<CallForCreateHelmRelease>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    rendererDi = builder.dis.rendererDi;

    overrideFsWithFakes(rendererDi);

    callForHelmChartsMock = asyncFn();
    callForHelmChartVersionsMock = asyncFn();
    callForHelmChartReadmeMock = asyncFn();
    callForHelmChartValuesMock = asyncFn();
    callForCreateHelmReleaseMock = asyncFn();

    builder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );

      rendererDi.override(hostedClusterIdInjectable, () => "some-cluster-id");

      rendererDi.override(
        callForHelmChartsInjectable,
        () => callForHelmChartsMock,
      );

      rendererDi.override(
        callForHelmChartVersionsInjectable,
        () => callForHelmChartVersionsMock,
      );

      rendererDi.override(
        callForHelmChartReadmeInjectable,
        () => callForHelmChartReadmeMock,
      );

      rendererDi.override(
        callForHelmChartValuesInjectable,
        () => callForHelmChartValuesMock,
      );

      rendererDi.override(
        callForCreateHelmReleaseInjectable,
        () => callForCreateHelmReleaseMock,
      );

      // TODO: Replace store mocking with mock for the actual side-effect (where the namespaces are coming from)
      rendererDi.override(
        namespaceStoreInjectable,
        () =>
          ({
            contextNamespaces: [],
            items: [
              { getName: () => "default" },
              { getName: () => "some-other-namespace" },
            ],
            selectNamespaces: () => {},
          } as unknown as NamespaceStore),
      );

      rendererDi.override(getRandomInstallChartTabIdInjectable, () =>
        jest
          .fn(() => "some-irrelevant-tab-id")
          .mockReturnValueOnce("some-first-tab-id")
          .mockReturnValueOnce("some-second-tab-id"),
      );
    });

    builder.setEnvironmentToClusterFrame();
  });

  describe("given tab for installing chart was not previously opened and application is started, when navigating to helm charts", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await builder.render();

      builder.helmCharts.navigate({
        chartName: "some-name",
        repo: "some-repository",
      });

      const writeJsonFile = rendererDi.inject(writeJsonFileInjectable);

      writeJsonFile(
        "/some-directory-for-lens-local-storage/some-cluster-id.json",
        {
          dock: {
            height: 300,
            tabs: [],
            isOpen: false,
          },
        },
      );

      const dockStore = rendererDi.inject(dockStoreInjectable);

      // TODO: Make TerminalWindow unit testable to allow realistic behaviour
      dockStore.closeTab("terminal");

      await callForHelmChartsMock.resolve([
        HelmChart.create({
          apiVersion: "some-api-version",
          name: "some-name",
          version: "some-version",
          repo: "some-repository",
          created: "2015-10-21T07:28:00Z",
          description: "some-description",
          keywords: [],
          sources: [],
          urls: [],
          annotations: {},
          dependencies: [],
          maintainers: [],
          deprecated: false,
        }),

        HelmChart.create({
          apiVersion: "some-api-version",
          name: "some-other-name",
          version: "some-version",
          repo: "some-repository",
          created: "2015-10-21T07:28:00Z",
          description: "some-description",
          keywords: [],
          sources: [],
          urls: [],
          annotations: {},
          dependencies: [],
          maintainers: [],
          deprecated: false,
        }),
      ]);

      await callForHelmChartVersionsMock.resolve([
        HelmChart.create({
          apiVersion: "some-api-version",
          name: "some-name",
          version: "some-version",
          repo: "some-repository",
          created: "2015-10-21T07:28:00Z",
          description: "some-description",
          keywords: [],
          sources: [],
          urls: [],
          annotations: {},
          dependencies: [],
          maintainers: [],
          deprecated: false,
        }),

        HelmChart.create({
          apiVersion: "some-api-version",
          name: "some-name",
          version: "some-other-version",
          repo: "some-repository",
          created: "2015-10-21T07:28:00Z",
          description: "some-description",
          keywords: [],
          sources: [],
          urls: [],
          annotations: {},
          dependencies: [],
          maintainers: [],
          deprecated: false,
        }),
      ]);

      await callForHelmChartReadmeMock.resolve("some-readme");
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when selecting to install the chart", () => {
      beforeEach(() => {
        callForHelmChartVersionsMock.mockClear();

        const installButton = rendered.getByTestId(
          "install-chart-for-some-repository-some-name",
        );

        fireEvent.click(installButton);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows dock tab for installing the chart", () => {
        expect(
          rendered.getByTestId("dock-tab-content-for-some-first-tab-id"),
        ).toBeInTheDocument();
      });

      it("calls for default configuration of the chart", () => {
        expect(callForHelmChartValuesMock).toHaveBeenCalledWith(
          "some-repository",
          "some-name",
          "some-version",
        );
      });

      it("calls for available versions", () => {
        expect(callForHelmChartVersionsMock).toHaveBeenCalledWith(
          "some-repository",
          "some-name",
        );
      });

      it("shows spinner in dock tab", () => {
        expect(
          rendered.getByTestId("install-chart-tab-spinner"),
        ).toBeInTheDocument();
      });

      it("given default configuration resolves but versions have not resolved yet, still shows the spinner", async () => {
        await callForHelmChartValuesMock.resolve(
          "some-default-configuration",
        );

        expect(
          rendered.getByTestId("install-chart-tab-spinner"),
        ).toBeInTheDocument();
      });

      it("given versions resolve but default configuration has not resolved yet, still shows the spinner", async () => {
        await callForHelmChartVersionsMock.resolve([]);

        expect(
          rendered.getByTestId("install-chart-tab-spinner"),
        ).toBeInTheDocument();
      });

      describe("when default configuration and versions resolve", () => {
        beforeEach(async () => {
          await callForHelmChartValuesMock.resolve(
            "some-default-configuration",
          );

          await callForHelmChartVersionsMock.resolve([
            HelmChart.create({
              apiVersion: "some-api-version",
              name: "some-name",
              version: "some-version",
              repo: "some-repository",
              created: "2015-10-21T07:28:00Z",
              description: "some-description",
              keywords: [],
              sources: [],
              urls: [],
              annotations: {},
              dependencies: [],
              maintainers: [],
              deprecated: false,
            }),

            HelmChart.create({
              apiVersion: "some-api-version",
              name: "some-name",
              version: "some-other-version",
              repo: "some-repository",
              created: "2015-10-21T07:28:00Z",
              description: "some-description",
              keywords: [],
              sources: [],
              urls: [],
              annotations: {},
              dependencies: [],
              maintainers: [],
              deprecated: false,
            }),
          ]);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not show spinner anymore", () => {
          expect(
            rendered.queryByTestId("install-chart-tab-spinner"),
          ).not.toBeInTheDocument();
        });

        describe("when cancelled", () => {
          beforeEach(() => {
            const cancelButton = rendered.getByTestId(
              "cancel-install-chart-from-tab-for-some-first-tab-id",
            );

            fireEvent.click(cancelButton);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("closes the tab", () => {
            expect(
              rendered.queryByTestId("dock-tab-for-some-first-tab-id"),
            ).not.toBeInTheDocument();
          });
        });

        describe("given no changes in configuration, when installing the chart", () => {
          let installButton: HTMLButtonElement;

          beforeEach(() => {
            installButton = rendered.getByTestId(
              "install-chart-from-tab-for-some-first-tab-id",
            ) as HTMLButtonElement;

            fireEvent.click(installButton);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("shows spinner in dock tab", () => {
            expect(
              rendered.getByTestId(
                "installing-chart-from-tab-some-first-tab-id",
              ),
            ).toBeInTheDocument();
          });

          it("install button is disabled", () => {
            expect(installButton).toHaveAttribute("disabled");
          });

          it("calls for installation with default configuration", () => {
            expect(callForCreateHelmReleaseMock).toHaveBeenCalledWith({
              chart: "some-name",
              name: undefined,
              namespace: "default",
              repo: "some-repository",
              values: "some-default-configuration",
              version: "some-version",
            });
          });

          describe("when installation resolves", () => {
            beforeEach(async () => {
              await callForCreateHelmReleaseMock.resolve({
                log: "some-execution-output",

                release: {
                  resources: [],
                  name: "some-release",
                  namespace: "default",
                  version: "some-version",
                  config: "some-config",
                  manifest: "some-manifest",

                  info: {
                    deleted: "some-deleted",
                    description: "some-description",
                    first_deployed: "some-first-deployed",
                    last_deployed: "some-last-deployed",
                    notes: "some-notes",
                    status: "some-status",
                  },
                },
              });
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("does not show spinner anymore", () => {
              expect(
                rendered.queryByTestId(
                  "installing-chart-from-tab-some-first-tab-id",
                ),
              ).not.toBeInTheDocument();
            });

            describe("when selected to see the installed release", () => {
              beforeEach(() => {
                const releaseButton = rendered.getByTestId(
                  "show-release-some-release-for-some-first-tab-id",
                );

                fireEvent.click(releaseButton);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("shows the details of installed release", () => {
                const currentPath = rendererDi
                  .inject(currentPathInjectable)
                  .get();

                expect(currentPath).toBe(
                  "/helm/releases/default/some-release",
                );
              });

              it("closes the dock tab", () => {
                expect(
                  rendered.queryByTestId(
                    "dock-tab-for-some-first-tab-id",
                  ),
                ).not.toBeInTheDocument();
              });
            });

            describe("when selected to show execution output", () => {
              beforeEach(() => {
                const showNotesButton = rendered.getByTestId(
                  "show-execution-output-for-some-release-in-some-first-tab-id",
                );

                fireEvent.click(showNotesButton);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("shows the execution output", () => {
                expect(
                  rendered.getByTestId(
                    "logs-dialog-for-helm-chart-install",
                  ),
                ).toHaveTextContent("some-execution-output");
              });

              it("does not close the dock tab", () => {
                expect(
                  rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                ).toBeInTheDocument();
              });
            });
          });
        });

        describe("given opening details for second chart, when details resolve", () => {
          beforeEach(async () => {
            callForHelmChartReadmeMock.mockClear();
            callForHelmChartVersionsMock.mockClear();

            const row = rendered.getByTestId(
              "helm-chart-row-for-some-repository-some-other-name",
            );

            fireEvent.click(row);

            await callForHelmChartVersionsMock.resolve([
              HelmChart.create({
                apiVersion: "some-api-version",
                name: "some-other-name",
                version: "some-version",
                repo: "some-repository",
                created: "2015-10-21T07:28:00Z",
                description: "some-description",
                keywords: [],
                sources: [],
                urls: [],
                annotations: {},
                dependencies: [],
                maintainers: [],
                deprecated: false,
              }),
            ]);

            await callForHelmChartReadmeMock.resolve("some-readme");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("when selecting to install second chart", () => {
            beforeEach(() => {
              callForHelmChartVersionsMock.mockClear();

              const installButton = rendered.getByTestId(
                "install-chart-for-some-repository-some-other-name",
              );

              fireEvent.click(installButton);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("shows dock tab for installing second chart", () => {
              expect(
                rendered.getByTestId(
                  "dock-tab-content-for-some-second-tab-id",
                ),
              ).toBeInTheDocument();
            });

            it("still has the dock tab for installing first chart", () => {
              expect(
                rendered.getByTestId("dock-tab-for-some-first-tab-id"),
              ).toBeInTheDocument();
            });

            it("calls for default configuration of the second chart", () => {
              expect(callForHelmChartValuesMock).toHaveBeenCalledWith(
                "some-repository",
                "some-other-name",
                "some-version",
              );
            });

            it("calls for available versions for the second chart", () => {
              expect(callForHelmChartVersionsMock).toHaveBeenCalledWith(
                "some-repository",
                "some-other-name",
              );
            });

            it("shows spinner in dock tab", () => {
              expect(
                rendered.getByTestId("install-chart-tab-spinner"),
              ).toBeInTheDocument();
            });

            describe("when configuration and versions resolve", () => {
              beforeEach(async () => {
                await callForHelmChartValuesMock.resolve(
                  "some-other-default-configuration",
                );

                await callForHelmChartVersionsMock.resolve([]);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not show spinner anymore", () => {
                expect(
                  rendered.queryByTestId("install-chart-tab-spinner"),
                ).not.toBeInTheDocument();
              });

              it("when installing the second chart, calls for installation of second chart", () => {
                const installButton = rendered.getByTestId(
                  "install-chart-from-tab-for-some-second-tab-id",
                );

                fireEvent.click(installButton);

                expect(
                  callForCreateHelmReleaseMock,
                ).toHaveBeenCalledWith({
                  chart: "some-other-name",
                  name: undefined,
                  namespace: "default",
                  repo: "some-repository",
                  values: "some-other-default-configuration",
                  version: "some-version",
                });
              });

              describe("when selecting the dock tab for installing first chart", () => {
                beforeEach(() => {
                  callForHelmChartValuesMock.mockClear();
                  callForHelmChartVersionsMock.mockClear();

                  const tab = rendered.getByTestId(
                    "dock-tab-for-some-first-tab-id",
                  );

                  fireEvent.click(tab);
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("does not call for default configuration", () => {
                  expect(
                    callForHelmChartValuesMock,
                  ).not.toHaveBeenCalled();
                });

                it("does not call for available versions", () => {
                  expect(
                    callForHelmChartVersionsMock,
                  ).not.toHaveBeenCalled();
                });

                it("does not show spinner", () => {
                  expect(
                    rendered.queryByTestId("install-chart-tab-spinner"),
                  ).not.toBeInTheDocument();
                });

                it("when installing the first chart, calls for installation of first chart", () => {
                  const installButton = rendered.getByTestId(
                    "install-chart-from-tab-for-some-first-tab-id",
                  );

                  fireEvent.click(installButton);

                  expect(
                    callForCreateHelmReleaseMock,
                  ).toHaveBeenCalledWith({
                    chart: "some-name",
                    name: undefined,
                    namespace: "default",
                    repo: "some-repository",
                    values: "some-default-configuration",
                    version: "some-version",
                  });
                });
              });
            });
          });
        });

        describe("given changing version to be installed", () => {
          let menu: { selectOption: (labelText: string) => void };

          beforeEach(() => {
            callForHelmChartVersionsMock.mockClear();
            callForHelmChartValuesMock.mockClear();

            const menuId =
                      "install-chart-version-select-for-some-first-tab-id";

            menu = builder.select.openMenu(menuId);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("when version is selected", () => {
            let installButton: HTMLButtonElement;

            beforeEach(() => {
              installButton = rendered.getByTestId(
                "install-chart-from-tab-for-some-first-tab-id",
              ) as HTMLButtonElement;

              menu.selectOption("some-other-version");
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("calls for default configuration for the version of chart", () => {
              expect(callForHelmChartValuesMock).toHaveBeenCalledWith(
                "some-repository",
                "some-name",
                "some-other-version",
              );
            });

            it("shows spinner", () => {
              expect(
                rendered.getByTestId(
                  "install-chart-configuration-spinner",
                ),
              ).toBeInTheDocument();
            });

            it("does not call for versions again", () => {
              expect(
                callForHelmChartVersionsMock,
              ).not.toHaveBeenCalled();
            });

            it("install button is disabled", () => {
              expect(installButton).toHaveAttribute("disabled");
            });

            it("stores the selected version", async () => {
              const readJsonFile = rendererDi.inject(readJsonFileInjectable);

              const actual = await readJsonFile(
                "/some-directory-for-lens-local-storage/some-cluster-id.json",
              ) as any;

              const version = actual.install_charts["some-first-tab-id"].version;

              expect(version).toBe("some-other-version");
            });

            describe("when default configuration resolves", () => {
              beforeEach(async () => {
                await callForHelmChartValuesMock.resolve(
                  "some-default-configuration-for-other-version",
                );
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not show spinner", () => {
                expect(
                  rendered.queryByTestId(
                    "install-chart-configuration-spinner",
                  ),
                ).not.toBeInTheDocument();
              });

              it("install button is enabled", () => {
                expect(installButton).not.toHaveAttribute("disabled");
              });

              it("when installing the chart, calls for installation with changed version and default configuration", () => {
                fireEvent.click(installButton);

                expect(
                  callForCreateHelmReleaseMock,
                ).toHaveBeenCalledWith({
                  chart: "some-name",
                  name: undefined,
                  namespace: "default",
                  repo: "some-repository",
                  values:
                            "some-default-configuration-for-other-version",
                  version: "some-other-version",
                });
              });
            });
          });
        });

        describe("given namespace selection is opened", () => {
          let menu: { selectOption: (labelText: string) => void };

          beforeEach(() => {
            const menuId =
                      "install-chart-namespace-select-for-some-first-tab-id";

            menu = builder.select.openMenu(menuId);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("when namespace is selected", () => {
            beforeEach(() => {
              menu.selectOption("some-other-namespace");
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("stores the selected namespace", async () => {
              const readJsonFile = rendererDi.inject(readJsonFileInjectable);

              const actual = await readJsonFile(
                "/some-directory-for-lens-local-storage/some-cluster-id.json",
              ) as any;

              const namespace = actual.install_charts["some-first-tab-id"].namespace;

              expect(namespace).toBe("some-other-namespace");
            });

            it("when installing the chart, calls for installation with changed namespace", () => {
              const installButton = rendered.getByTestId(
                "install-chart-from-tab-for-some-first-tab-id",
              );

              fireEvent.click(installButton);

              expect(callForCreateHelmReleaseMock).toHaveBeenCalledWith(
                {
                  chart: "some-name",
                  name: undefined,
                  namespace: "some-other-namespace",
                  repo: "some-repository",
                  values: "some-default-configuration",
                  version: "some-version",
                },
              );
            });
          });
        });

        describe("given invalid change in configuration", () => {
          let installButton: HTMLButtonElement;
          let input: HTMLInputElement;

          beforeEach(() => {
            installButton = rendered.getByTestId(
              "install-chart-from-tab-for-some-first-tab-id",
            ) as HTMLButtonElement;

            input = rendered.getByTestId(
              "monaco-editor-for-some-first-tab-id",
            ) as HTMLInputElement;

            fireEvent.change(input, {
              target: { value: "@some-invalid-configuration@" },
            });
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("updates the editor with the changed value", () => {
            const input = rendered.getByTestId(
              "monaco-editor-for-some-first-tab-id",
            );

            expect(input).toHaveValue("@some-invalid-configuration@");
          });

          it("install button is disabled", () => {
            expect(installButton).toHaveAttribute("disabled");
          });

          it("when valid change in configuration, install button is enabled", () => {
            fireEvent.change(input, {
              target: { value: "some-valid-configuration" },
            });

            expect(installButton).not.toHaveAttribute("disabled");
          });

          it("given change in version, when default configuration resolves, install button is enabled", async () => {
            builder.select
              .openMenu(
                "install-chart-version-select-for-some-first-tab-id",
              )
              .selectOption("some-other-version");

            await callForHelmChartValuesMock.resolve(
              "some-default-configuration-for-other-version",
            );

            expect(installButton).not.toHaveAttribute("disabled");
          });
        });

        describe("given valid change in configuration", () => {
          beforeEach(() => {
            const input = rendered.getByTestId(
              "monaco-editor-for-some-first-tab-id",
            );

            fireEvent.change(input, {
              target: { value: "some-valid-configuration" },
            });
          });

          it("updates the editor with the changed value", () => {
            const input = rendered.getByTestId(
              "monaco-editor-for-some-first-tab-id",
            );

            expect(input).toHaveValue("some-valid-configuration");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("stores the changed configuration", async () => {
            const readJsonFile = rendererDi.inject(readJsonFileInjectable);

            const actual = await readJsonFile(
              "/some-directory-for-lens-local-storage/some-cluster-id.json",
            ) as any;

            const configuration = actual.install_charts["some-first-tab-id"].values;

            expect(configuration).toBe("some-valid-configuration");
          });

          it("does not show spinner", () => {
            expect(
              rendered.queryByTestId("install-chart-tab-spinner"),
            ).not.toBeInTheDocument();
          });

          it("when installing the chart, calls for installation with changed configuration", () => {
            const installButton = rendered.getByTestId(
              "install-chart-from-tab-for-some-first-tab-id",
            );

            fireEvent.click(installButton);

            expect(callForCreateHelmReleaseMock).toHaveBeenCalledWith({
              chart: "some-name",
              name: undefined,
              namespace: "default",
              repo: "some-repository",
              values: "some-valid-configuration",
              version: "some-version",
            });
          });

          it("given version is changed, when default configuration resolves, defaults back to default configuration", async () => {
            builder.select
              .openMenu(
                "install-chart-version-select-for-some-first-tab-id",
              )
              .selectOption("some-other-version");

            await callForHelmChartValuesMock.resolve(
              "some-default-configuration-for-other-version",
            );

            const input = rendered.getByTestId(
              "monaco-editor-for-some-first-tab-id",
            );

            expect(input).toHaveValue(
              "some-default-configuration-for-other-version",
            );
          });
        });

        describe("given custom name is inputted", () => {
          beforeEach(() => {
            const input = rendered.getByTestId(
              "install-chart-custom-name-input-for-some-first-tab-id",
            );

            fireEvent.change(input, {
              target: { value: "some-custom-name" },
            });

          });

          it("stores the changed custom name", async () => {
            const readJsonFile = rendererDi.inject(readJsonFileInjectable);

            const actual = await readJsonFile(
              "/some-directory-for-lens-local-storage/some-cluster-id.json",
            ) as any;

            const customName = actual.install_charts["some-first-tab-id"].releaseName;

            expect(customName).toBe("some-custom-name");
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("when installed, calls for installation with custom name", () => {
            const installButton = rendered.getByTestId(
              "install-chart-from-tab-for-some-first-tab-id",
            );

            fireEvent.click(installButton);

            expect(callForCreateHelmReleaseMock).toHaveBeenCalledWith({
              chart: "some-name",
              name: "some-custom-name",
              namespace: "default",
              repo: "some-repository",
              values: "some-default-configuration",
              version: "some-version",
            });
          });
        });
      });
    });
  });
});
