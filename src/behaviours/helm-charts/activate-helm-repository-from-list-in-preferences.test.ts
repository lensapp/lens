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
import type { HelmRepo } from "../../common/helm-repo";
import callForPublicHelmRepositoriesInjectable from "../../renderer/components/+preferences/kubernetes/helm-charts/activation-of-public-helm-repository/public-helm-repositories/call-for-public-helm-repositories.injectable";

describe("activate helm repository from list in preferences", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;
  let execFileMock: AsyncFnMock<
    ReturnType<typeof execFileInjectable["instantiate"]>
  >;
  let getActiveHelmRepositoriesMock: AsyncFnMock<() => Promise<HelmRepo[]>>;
  let callForPublicHelmRepositoriesMock: AsyncFnMock<() => Promise<HelmRepo[]>>;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    execFileMock = asyncFn();
    getActiveHelmRepositoriesMock = asyncFn();
    callForPublicHelmRepositoriesMock = asyncFn();

    applicationBuilder.beforeApplicationStart(({ mainDi, rendererDi }) => {
      rendererDi.override(
        callForPublicHelmRepositoriesInjectable,
        () => callForPublicHelmRepositoriesMock,
      );

      mainDi.override(
        getActiveHelmRepositoriesInjectable,
        () => getActiveHelmRepositoriesMock,
      );
      mainDi.override(execFileInjectable, () => execFileMock);
      mainDi.override(helmBinaryPathInjectable, () => "some-helm-binary-path");
    });

    rendered = await applicationBuilder.render();
  });

  describe("when navigating to preferences containing helm repositories", () => {
    beforeEach(async () => {
      applicationBuilder.preferences.navigate();
      applicationBuilder.preferences.navigation.click("kubernetes");
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
            { name: "Some to be activated repository", url: "some-other-url" },
          ]),

          getActiveHelmRepositoriesMock.resolve([
            { name: "Some already active repository", url: "some-url" },
          ]),
        ]);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when select for selecting active repositories is clicked", () => {
        beforeEach(() => {
          applicationBuilder.select.openMenu(
            "selection-of-active-public-helm-repository",
          );
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        describe("when deactive public repository is selected", () => {
          beforeEach(async () => {
            getActiveHelmRepositoriesMock.mockClear();

            applicationBuilder.select.selectOption(
              "selection-of-active-public-helm-repository",
              "Some to be activated repository",
            );
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("activates the repository", () => {
            expect(execFileMock).toHaveBeenCalledWith(
              "some-helm-binary-path",
              ["repo", "add", "Some to be activated repository", "some-other-url"],
            );
          });

          it("does not reload active repositories yet", () => {
            expect(getActiveHelmRepositoriesMock).not.toHaveBeenCalled();
          });

          describe("when activating resolves", () => {
            beforeEach(async () => {
              await execFileMock.resolveSpecific(
                [
                  "some-helm-binary-path",
                  ["repo", "add", "Some to be activated repository", "some-other-url"],
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

            describe("when active repositories resolve again", () => {
              beforeEach(async () => {
                await getActiveHelmRepositoriesMock.resolve([
                  { name: "Some already active repository", url: "some-url" },
                  { name: "Some to be activated repository", url: "some-other-url" },
                ]);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              describe("when select for selecting active repositories is clicked", () => {
                beforeEach(() => {
                  applicationBuilder.select.openMenu(
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

                    applicationBuilder.select.selectOption(
                      "selection-of-active-public-helm-repository",
                      "Some already active repository",
                    );
                  });

                  it("renders", () => {
                    expect(rendered.baseElement).toMatchSnapshot();
                  });

                  it("deactivates the repository", () => {
                    expect(execFileMock).toHaveBeenCalledWith(
                      "some-helm-binary-path",
                      ["repo", "remove", "Some already active repository"],
                    );
                  });

                  it("does not reload active repositories yet", () => {
                    expect(getActiveHelmRepositoriesMock).not.toHaveBeenCalled();
                  });

                  describe("when deactivating resolves", () => {
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
