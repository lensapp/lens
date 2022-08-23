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
import type { CallForHelmReleases } from "../../renderer/components/+helm-releases/call-for-helm-releases/call-for-helm-releases.injectable";
import callForHelmReleasesInjectable from "../../renderer/components/+helm-releases/call-for-helm-releases/call-for-helm-releases.injectable";
import namespaceStoreInjectable from "../../renderer/components/+namespaces/store.injectable";
import type { NamespaceStore } from "../../renderer/components/+namespaces/store";
import type { CallForHelmReleaseConfiguration } from "../../renderer/components/+helm-releases/release-details/release-details-model/call-for-helm-release-configuration/call-for-helm-release-configuration.injectable";
import callForHelmReleaseConfigurationInjectable from "../../renderer/components/+helm-releases/release-details/release-details-model/call-for-helm-release-configuration/call-for-helm-release-configuration.injectable";
import type { CallForHelmReleaseUpdate } from "../../renderer/components/+helm-releases/update-release/call-for-helm-release-update/call-for-helm-release-update.injectable";
import callForHelmReleaseUpdateInjectable from "../../renderer/components/+helm-releases/update-release/call-for-helm-release-update/call-for-helm-release-update.injectable";
import { useFakeTime } from "../../common/test-utils/use-fake-time";
import type { CallForHelmRelease, DetailedHelmRelease } from "../../renderer/components/+helm-releases/release-details/release-details-model/call-for-helm-release/call-for-helm-release.injectable";
import callForHelmReleaseInjectable from "../../renderer/components/+helm-releases/release-details/release-details-model/call-for-helm-release/call-for-helm-release.injectable";
import showSuccessNotificationInjectable from "../../renderer/components/notifications/show-success-notification.injectable";
import showCheckedErrorInjectable from "../../renderer/components/notifications/show-checked-error.injectable";
import getRandomUpgradeChartTabIdInjectable from "../../renderer/components/dock/upgrade-chart/get-random-upgrade-chart-tab-id.injectable";

describe("showing details for helm release", () => {
  let builder: ApplicationBuilder;
  let callForHelmReleasesMock: AsyncFnMock<CallForHelmReleases>;
  let callForHelmReleaseMock: AsyncFnMock<CallForHelmRelease>;
  let callForHelmReleaseConfigurationMock: AsyncFnMock<CallForHelmReleaseConfiguration>;
  let callForHelmReleaseUpdateMock: AsyncFnMock<CallForHelmReleaseUpdate>;
  let showSuccessNotificationMock: jest.Mock;
  let showCheckedErrorNotificationMock: jest.Mock;

  beforeEach(() => {
    useFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    callForHelmReleasesMock = asyncFn();
    callForHelmReleaseMock = asyncFn();
    callForHelmReleaseConfigurationMock = asyncFn();
    callForHelmReleaseUpdateMock = asyncFn();

    showSuccessNotificationMock = jest.fn();
    showCheckedErrorNotificationMock = jest.fn();

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(
        getRandomUpgradeChartTabIdInjectable,
        () => () => "some-tab-id",
      );

      windowDi.override(
        showSuccessNotificationInjectable,
        () => showSuccessNotificationMock,
      );

      windowDi.override(
        showCheckedErrorInjectable,
        () => showCheckedErrorNotificationMock,
      );

      windowDi.override(
        callForHelmReleasesInjectable,
        () => callForHelmReleasesMock,
      );

      windowDi.override(
        callForHelmReleaseInjectable,
        () => callForHelmReleaseMock,
      );

      windowDi.override(
        callForHelmReleaseConfigurationInjectable,
        () => callForHelmReleaseConfigurationMock,
      );

      windowDi.override(
        callForHelmReleaseUpdateInjectable,
        () => callForHelmReleaseUpdateMock,
      );

      windowDi.override(
        namespaceStoreInjectable,
        () =>
          ({
            contextNamespaces: ["some-namespace", "some-other-namespace"],
            items: [],
            selectNamespaces: () => {},
          } as unknown as NamespaceStore),
      );
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
        expect(callForHelmReleasesMock.mock.calls).toEqual([
          ["some-namespace"],
          ["some-other-namespace"],
        ]);
      });

      it("shows spinner", () => {
        expect(
          rendered.getByTestId("helm-releases-spinner"),
        ).toBeInTheDocument();
      });

      it("when releases resolve but there is none, renders", async () => {
        await callForHelmReleasesMock.resolve([]);
        await callForHelmReleasesMock.resolve([]);

        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when releases resolve", () => {
        beforeEach(async () => {
          await callForHelmReleasesMock.resolveSpecific(
            ([namespace]) => namespace === "some-namespace",
            [
              {
                appVersion: "some-app-version",
                name: "some-name",
                namespace: "some-namespace",
                chart: "some-chart",
                status: "some-status",
                updated: "some-updated",
                revision: "some-revision",
              },
            ],
          );

          await callForHelmReleasesMock.resolveSpecific(
            ([namespace]) => namespace === "some-other-namespace",
            [
              {
                appVersion: "some-other-app-version",
                name: "some-other-name",
                namespace: "some-other-namespace",
                chart: "some-other-chart",
                status: "some-other-status",
                updated: "some-other-updated",
                revision: "some-other-revision",
              },
            ],
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
            expect(callForHelmReleaseMock).toHaveBeenCalledWith(
              "some-name",
              "some-namespace",
            );
          });

          it("shows spinner", () => {
            expect(
              rendered.getByTestId("helm-release-detail-content-spinner"),
            ).toBeInTheDocument();
          });

          describe("when opening details for second release", () => {
            beforeEach(() => {
              callForHelmReleaseMock.mockClear();

              const row = rendered.getByTestId(
                "helm-release-row-for-some-other-namespace/some-other-name",
              );

              fireEvent.click(row);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("calls for another release", () => {
              expect(callForHelmReleaseMock).toHaveBeenCalledWith(
                "some-other-name",
                "some-other-namespace",
              );
            });

            it("closes details for first release", () => {
              expect(
                rendered.queryByTestId("helm-release-details-for-some-namespace/some-name"),
              ).not.toBeInTheDocument();
            });

            it("opens details for second release", () => {
              expect(
                rendered.getByTestId("helm-release-details-for-some-other-namespace/some-other-name"),
              ).toBeInTheDocument();
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
                callForHelmReleaseMock.mockClear();

                const row = rendered.getByTestId(
                  "helm-release-row-for-some-namespace/some-name",
                );

                fireEvent.click(row);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not reload", () => {
                expect(callForHelmReleaseMock).not.toHaveBeenCalled();
              });
            });
          });

          it("when release resolve with no data, renders", async () => {
            await callForHelmReleaseMock.resolve(undefined);

            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("when details resolve", () => {
            beforeEach(async () => {
              await callForHelmReleaseMock.resolve(detailedReleaseFake);
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("calls for release configuration", () => {
              expect(callForHelmReleaseConfigurationMock).toHaveBeenCalledWith(
                "some-name",
                "some-namespace",
                true,
              );
            });

            describe("when configuration resolves", () => {
              beforeEach(async () => {
                await callForHelmReleaseConfigurationMock.resolve(
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
                    "monaco-editor-for-helm-release-configuration",
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
                    "monaco-editor-for-helm-release-configuration",
                  );

                  expect(input).toHaveValue("some-new-configuration");
                });

                it("does not save changes yet", () => {
                  expect(callForHelmReleaseUpdateMock).not.toHaveBeenCalled();
                });

                describe("when toggling to see only user defined values", () => {
                  beforeEach(() => {
                    callForHelmReleaseConfigurationMock.mockClear();

                    const toggle = rendered.getByTestId(
                      "user-supplied-values-only-checkbox",
                    );

                    fireEvent.click(toggle);
                  });

                  it("calls for only user defined configuration", () => {
                    expect(callForHelmReleaseConfigurationMock).toHaveBeenCalledWith(
                      "some-name",
                      "some-namespace",
                      false,
                    );
                  });

                  describe("when configuration resolves", () => {
                    beforeEach(async () => {
                      await callForHelmReleaseConfigurationMock.resolve(
                        "some-other-configuration",
                      );
                    });

                    it("renders", () => {
                      expect(rendered.baseElement).toMatchSnapshot();
                    });

                    it("overrides the user inputted configuration with new configuration", () => {
                      const input = rendered.getByTestId(
                        "monaco-editor-for-helm-release-configuration",
                      );

                      expect(input).toHaveValue("some-other-configuration");
                    });

                    it("when toggling again, calls for all configuration", () => {
                      callForHelmReleaseConfigurationMock.mockClear();

                      const toggle = rendered.getByTestId(
                        "user-supplied-values-only-checkbox",
                      );

                      fireEvent.click(toggle);

                      expect(callForHelmReleaseConfigurationMock).toHaveBeenCalledWith(
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

                  it("calls for update", () => {
                    expect(callForHelmReleaseUpdateMock).toHaveBeenCalledWith(
                      "some-name",
                      "some-namespace",

                      {
                        chart: "some-chart",
                        repo: "",
                        values: "some-new-configuration",
                        version: "",
                      },
                    );
                  });

                  it("shows spinner", () => {
                    const saveButton = rendered.getByTestId(
                      "helm-release-configuration-save-button",
                    );

                    expect(saveButton).toHaveClass("waiting");
                  });

                  describe("when update resolves with success", () => {
                    beforeEach(async () => {
                      callForHelmReleasesMock.mockClear();
                      callForHelmReleaseConfigurationMock.mockClear();

                      await callForHelmReleaseUpdateMock.resolve({
                        updateWasSuccessful: true,
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
                      expect(callForHelmReleaseConfigurationMock).toHaveBeenCalledWith(
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
                      callForHelmReleasesMock.mockClear();
                      callForHelmReleaseConfigurationMock.mockClear();

                      await callForHelmReleaseUpdateMock.resolve({
                        updateWasSuccessful: false,
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
                      expect(callForHelmReleaseConfigurationMock).not.toHaveBeenCalled();
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

const detailedReleaseFake: DetailedHelmRelease = {
  release: {
    appVersion: "some-app-version",
    chart: "some-chart",
    status: "some-status",
    updated: "some-updated",
    revision: "some-revision",
    name: "some-name",
    namespace: "some-namespace",
  },

  details: {
    name: "some-name",
    namespace: "some-namespace",
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
};
