/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import execFileInjectable from "../../common/fs/exec-file.injectable";
import helmBinaryPathInjectable from "../../main/helm/helm-binary-path.injectable";
import getActiveHelmRepositoriesInjectable from "../../main/helm/repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";
import type { HelmRepo } from "../../common/helm/helm-repo";
import callForPublicHelmRepositoriesInjectable from "../../renderer/components/+preferences/kubernetes/helm-charts/adding-of-public-helm-repository/public-helm-repositories/call-for-public-helm-repositories.injectable";
import showSuccessNotificationInjectable from "../../renderer/components/notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../../renderer/components/notifications/show-error-notification.injectable";
import type { AsyncResult } from "../../common/utils/async-result";

describe("add helm repository from list in preferences", () => {
  let builder: ApplicationBuilder;
  let showSuccessNotificationMock: jest.Mock;
  let showErrorNotificationMock: jest.Mock;
  let rendered: RenderResult;
  let execFileMock: AsyncFnMock<
    ReturnType<typeof execFileInjectable["instantiate"]>
  >;
  let getActiveHelmRepositoriesMock: AsyncFnMock<() => Promise<AsyncResult<HelmRepo[]>>>;
  let callForPublicHelmRepositoriesMock: AsyncFnMock<() => Promise<HelmRepo[]>>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    execFileMock = asyncFn();
    getActiveHelmRepositoriesMock = asyncFn();
    callForPublicHelmRepositoriesMock = asyncFn();
    showSuccessNotificationMock = jest.fn();
    showErrorNotificationMock = jest.fn();

    builder.beforeApplicationStart((mainDi) => {
      mainDi.override(getActiveHelmRepositoriesInjectable, () => getActiveHelmRepositoriesMock);
      mainDi.override(execFileInjectable, () => execFileMock);
      mainDi.override(helmBinaryPathInjectable, () => "some-helm-binary-path");
    });

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(showSuccessNotificationInjectable, () => showSuccessNotificationMock);
      windowDi.override(showErrorNotificationInjectable, () => showErrorNotificationMock);
      windowDi.override(callForPublicHelmRepositoriesInjectable, () => callForPublicHelmRepositoriesMock);
    });

    rendered = await builder.render();
  });

  describe("when navigating to preferences containing helm repositories", () => {
    beforeEach(() => {
      builder.preferences.navigate();
      builder.preferences.navigation.click("kubernetes");
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("calls for public repositories", () => {
      expect(callForPublicHelmRepositoriesMock).toHaveBeenCalled();
    });

    it("calls for active repositories", () => {
      expect(getActiveHelmRepositoriesMock).toHaveBeenCalled();
    });

    describe("when both active and public repositories resolve", () => {
      beforeEach(async () => {
        await Promise.all([
          callForPublicHelmRepositoriesMock.resolve([
            { name: "Some already active repository", url: "some-url" },
            { name: "Some to be added repository", url: "some-other-url" },
          ]),

          getActiveHelmRepositoriesMock.resolve({
            callWasSuccessful: true,
            response: [
              { name: "Some already active repository", url: "some-url" },
            ],
          }),
        ]);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when select for adding public repositories is clicked", () => {
        beforeEach(() => {
          builder.select.openMenu(
            "selection-of-active-public-helm-repository",
          );
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when deactive public repository is selected", () => {
          beforeEach(async () => {
            getActiveHelmRepositoriesMock.mockClear();

            builder.select.selectOption(
              "selection-of-active-public-helm-repository",
              "Some to be added repository",
            );
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("adds the repository", () => {
            expect(execFileMock).toHaveBeenCalledWith(
              "some-helm-binary-path",
              ["repo", "add", "Some to be added repository", "some-other-url"],
            );
          });

          it("does not reload active repositories yet", () => {
            expect(getActiveHelmRepositoriesMock).not.toHaveBeenCalled();
          });

          describe("when adding rejects", () => {
            beforeEach(async () => {
              await execFileMock.reject(
                "Some error",
              );
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("shows error notification", () => {
              expect(showErrorNotificationMock).toHaveBeenCalledWith(
                "Some error",
              );
            });

            it("does not show success notification", () => {
              expect(showSuccessNotificationMock).not.toHaveBeenCalled();
            });

            it("does not show dialog anymore", () => {
              expect(rendered.queryByTestId("add-custom-helm-repository-dialog")).not.toBeInTheDocument();
            });

            it("does not reload active repositories", () => {
              expect(getActiveHelmRepositoriesMock).not.toHaveBeenCalled();
            });
          });

          describe("when adding resolves", () => {
            beforeEach(async () => {
              await execFileMock.resolveSpecific(
                [
                  "some-helm-binary-path",
                  ["repo", "add", "Some to be added repository", "some-other-url"],
                ],

                "",
              );
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("reloads active repositories", () => {
              expect(getActiveHelmRepositoriesMock).toHaveBeenCalled();
            });

            it("shows success notification", () => {
              expect(showSuccessNotificationMock).toHaveBeenCalledWith(
                "Helm repository Some to be added repository has been added.",
              );
            });

            describe("when active repositories resolve again", () => {
              beforeEach(async () => {
                await getActiveHelmRepositoriesMock.resolve({
                  callWasSuccessful: true,
                  response: [
                    { name: "Some already active repository", url: "some-url" },
                    { name: "Some to be added repository", url: "some-other-url" },
                  ],
                });
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              describe("when select for selecting active repositories is clicked", () => {
                beforeEach(() => {
                  builder.select.openMenu(
                    "selection-of-active-public-helm-repository",
                  );
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                describe("when active repository is selected", () => {
                  beforeEach(() => {
                    execFileMock.mockClear();
                    getActiveHelmRepositoriesMock.mockClear();

                    builder.select.selectOption(
                      "selection-of-active-public-helm-repository",
                      "Some already active repository",
                    );
                  });

                  it("renders", () => {
                    expect(rendered.baseElement).toMatchSnapshot();
                  });

                  it("removes the repository", () => {
                    expect(execFileMock).toHaveBeenCalledWith(
                      "some-helm-binary-path",
                      ["repo", "remove", "Some already active repository"],
                    );
                  });

                  it("does not reload active repositories yet", () => {
                    expect(getActiveHelmRepositoriesMock).not.toHaveBeenCalled();
                  });

                  describe("when removing resolves", () => {
                    beforeEach(async () => {
                      await execFileMock.resolveSpecific(
                        [
                          "some-helm-binary-path",
                          ["repo", "remove", "Some already active repository"],
                        ],

                        "",
                      );
                    });

                    it("renders", () => {
                      expect(rendered.baseElement).toMatchSnapshot();
                    });

                    it("reloads active repositories", () => {
                      expect(getActiveHelmRepositoriesMock).toHaveBeenCalled();
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
