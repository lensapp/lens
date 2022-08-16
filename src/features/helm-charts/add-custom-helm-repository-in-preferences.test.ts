/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import execFileInjectable from "../../common/fs/exec-file.injectable";
import helmBinaryPathInjectable from "../../main/helm/helm-binary-path.injectable";
import getActiveHelmRepositoriesInjectable from "../../main/helm/repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";
import type { HelmRepo } from "../../common/helm/helm-repo";
import callForPublicHelmRepositoriesInjectable from "../../renderer/components/+preferences/kubernetes/helm-charts/adding-of-public-helm-repository/public-helm-repositories/call-for-public-helm-repositories.injectable";
import isPathInjectable from "../../renderer/components/input/validators/is-path.injectable";
import showSuccessNotificationInjectable from "../../renderer/components/notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../../renderer/components/notifications/show-error-notification.injectable";
import type { AsyncResult } from "../../common/utils/async-result";

describe("add custom helm repository in preferences", () => {
  let builder: ApplicationBuilder;
  let showSuccessNotificationMock: jest.Mock;
  let showErrorNotificationMock: jest.Mock;
  let rendered: RenderResult;
  let execFileMock: AsyncFnMock<
    ReturnType<typeof execFileInjectable["instantiate"]>
  >;
  let getActiveHelmRepositoriesMock: AsyncFnMock<() => Promise<AsyncResult<HelmRepo[]>>>;

  beforeEach(async () => {
    jest.useFakeTimers();

    builder = getApplicationBuilder();

    execFileMock = asyncFn();
    getActiveHelmRepositoriesMock = asyncFn();
    showSuccessNotificationMock = jest.fn();
    showErrorNotificationMock = jest.fn();

    builder.beforeApplicationStart((mainDi) => {
      mainDi.override(getActiveHelmRepositoriesInjectable, () => getActiveHelmRepositoriesMock);
      mainDi.override(execFileInjectable, () => execFileMock);
      mainDi.override(helmBinaryPathInjectable, () => "some-helm-binary-path");
    });

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(callForPublicHelmRepositoriesInjectable, () => async () => []);
      windowDi.override(showSuccessNotificationInjectable, () => showSuccessNotificationMock);
      windowDi.override(showErrorNotificationInjectable, () => showErrorNotificationMock);

      // TODO: Figure out how to make async validators unit testable
      windowDi.override(isPathInjectable, () => ({ debounce: 0, validate: async () => {} }));
    });

    rendered = await builder.render();
  });

  describe("when navigating to preferences containing helm repositories", () => {
    beforeEach(async () => {
      builder.preferences.navigate();
      builder.preferences.navigation.click("kubernetes");
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    describe("when active repositories resolve", () => {
      beforeEach(async () => {
        await Promise.all([
          getActiveHelmRepositoriesMock.resolve({
            callWasSuccessful: true,
            response: [
              { name: "Some active repository", url: "some-url" },
            ],
          }),
        ]);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when selecting to add custom repository", () => {
        beforeEach(() => {
          const button = rendered.getByTestId("add-custom-helm-repo-button");

          fireEvent.click(button);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("shows dialog", () => {
          expect(
            rendered.queryByTestId("add-custom-helm-repository-dialog"),
          ).toBeInTheDocument();
        });

        // TODO: Figure out how to close dialog by clicking outside of it
        xdescribe("when closing the dialog by clicking outside", () => {
          beforeEach(() => {});

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("does not show dialog anymore", () => {
            expect(
              rendered.queryByTestId("add-custom-helm-repository-dialog"),
            ).not.toBeInTheDocument();
          });
        });

        describe("when closing the dialog by clicking cancel", () => {
          beforeEach(() => {
            const button = rendered.getByTestId("custom-helm-repository-cancel-button");

            fireEvent.click(button);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("does not show dialog anymore", () => {
            expect(
              rendered.queryByTestId("add-custom-helm-repository-dialog"),
            ).not.toBeInTheDocument();
          });
        });

        describe("when inputted minimal options for the repository", () => {
          beforeEach(() => {
            getActiveHelmRepositoriesMock.mockClear();

            const nameInput = rendered.getByTestId("custom-helm-repository-name-input");

            fireEvent.change(nameInput, { target: { value: "some-custom-repository" }});

            const urlInput = rendered.getByTestId("custom-helm-repository-url-input");

            fireEvent.change(urlInput, { target: { value: "http://some.url" }});
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          describe("when submitted and some time passes", () => {
            beforeEach(() => {
              const submitButton = rendered.getByTestId("custom-helm-repository-submit-button");

              fireEvent.click(submitButton);

              // TODO: Remove when debounce is removed from WizardStep.submit
              jest.runOnlyPendingTimers();
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("adds the repository", () => {
              expect(execFileMock).toHaveBeenCalledWith(
                "some-helm-binary-path",
                ["repo", "add", "some-custom-repository", "http://some.url"],
              );
            });

            it("does not reload active repositories yet", () => {
              expect(getActiveHelmRepositoriesMock).not.toHaveBeenCalled();
            });

            it("does not show notification yet", () => {
              expect(showSuccessNotificationMock).not.toHaveBeenCalled();
            });

            describe("when activation rejects", () => {
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

            describe("when activation resolves with success", () => {
              beforeEach(async () => {
                await execFileMock.resolveSpecific(
                  [
                    "some-helm-binary-path",
                    ["repo", "add", "some-custom-repository", "http://some.url"],
                  ],

                  "",
                );
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not show dialog anymore", () => {
                expect(rendered.queryByTestId("add-custom-helm-repository-dialog")).not.toBeInTheDocument();
              });

              it("reloads active repositories", () => {
                expect(getActiveHelmRepositoriesMock).toHaveBeenCalled();
              });

              it("shows success notification", () => {
                expect(showSuccessNotificationMock).toHaveBeenCalledWith(
                  "Helm repository some-custom-repository has been added.",
                );
              });

              describe("when adding custom repository again", () => {
                beforeEach(() => {
                  const button = rendered.getByTestId("add-custom-helm-repo-button");

                  fireEvent.click(button);
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("repository name is empty", () => {
                  const input = rendered.getByTestId("custom-helm-repository-name-input") as HTMLInputElement;

                  expect(input.value).toBe("");
                });

                it("repository url is empty", () => {
                  const input = rendered.getByTestId("custom-helm-repository-url-input") as HTMLInputElement;

                  expect(input.value).toBe("");
                });
              });
            });
          });

          describe("when showing the maximal options", () => {
            beforeEach(() => {
              const button = rendered.getByTestId("toggle-maximal-options-for-custom-helm-repository-button");

              fireEvent.click(button);
            });

            it("shows maximal options", () => {
              const maximalOptions = rendered.getByTestId("maximal-options-for-custom-helm-repository-dialog");

              expect(maximalOptions).toBeInTheDocument();
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("given closing the dialog, when reopening the dialog, still shows maximal options", () => {
              const cancelButton = rendered.getByTestId("custom-helm-repository-cancel-button");

              fireEvent.click(cancelButton);

              const openButton = rendered.getByTestId("add-custom-helm-repo-button");

              fireEvent.click(openButton);

              const maximalOptions = rendered.getByTestId("maximal-options-for-custom-helm-repository-dialog");

              expect(maximalOptions).toBeInTheDocument();
            });

            describe("when hiding maximal options", () => {
              beforeEach(() => {
                const button = rendered.getByTestId("toggle-maximal-options-for-custom-helm-repository-button");

                fireEvent.click(button);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not show maximal options anymore", () => {
                const maximalOptions = rendered.queryByTestId("maximal-options-for-custom-helm-repository-dialog");

                expect(maximalOptions).not.toBeInTheDocument();
              });
            });

            describe("when inputted maximal options", () => {
              beforeEach(async () => {
                [
                  { selector: "username-input", value: "some-username" },
                  { selector: "password-input", value: "some-password" },
                  { selector: "ca-cert-file-input", value: "some-ca-cert-file" },
                  { selector: "cert-file-input", value: "some-cert-file" },
                  { selector: "key-file-input", value: "some-key-file" },
                ].forEach(({ selector, value }) => {
                  const input = rendered.getByTestId(`custom-helm-repository-${selector}`);

                  fireEvent.change(input, { target: { value }});
                });

                const checkbox = rendered.getByTestId(`custom-helm-repository-verify-tls-input`);

                fireEvent.click(checkbox);

                jest.runOnlyPendingTimers();
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("when submitted and some time passes, adds the repository with maximal options", () => {
                const submitButton = rendered.getByTestId("custom-helm-repository-submit-button");

                fireEvent.click(submitButton);

                // TODO: Remove when debounce is removed from WizardStep.submit
                jest.runOnlyPendingTimers();

                expect(execFileMock).toHaveBeenCalledWith(
                  "some-helm-binary-path",
                  [
                    "repo",
                    "add",
                    "some-custom-repository",
                    "http://some.url",
                    "--insecure-skip-tls-verify",
                    "--username",
                    "some-username",
                    "--password",
                    "some-password",
                    "--ca-file",
                    "some-ca-cert-file",
                    "--key-file",
                    "some-key-file",
                    "--cert-file",
                    "some-cert-file",
                  ],
                );
              });
            });
          });
        });
      });
    });
  });
});
