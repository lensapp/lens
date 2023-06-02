/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { ReadYamlFile } from "../../common/fs/read-yaml-file.injectable";
import readYamlFileInjectable from "../../common/fs/read-yaml-file.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { HelmRepositoriesFromYaml } from "../../main/helm/repositories/get-active-helm-repositories/get-active-helm-repositories.injectable";
import execFileInjectable, { type ExecFile } from "../../common/fs/exec-file.injectable";
import helmBinaryPathInjectable from "../../main/helm/helm-binary-path.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { Logger } from "@k8slens/logger";
import requestPublicHelmRepositoriesInjectable from "./child-features/preferences/renderer/adding-of-public-helm-repository/public-helm-repositories/request-public-helm-repositories.injectable";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { noop } from "@k8slens/utilities";

describe("listing active helm repositories in preferences", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let readYamlFileMock: AsyncFnMock<ReadYamlFile>;
  let execFileMock: AsyncFnMock<ExecFile>;
  let loggerStub: Logger;
  let showErrorNotificationMock: jest.Mock;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    readYamlFileMock = asyncFn();
    execFileMock = asyncFn();
    showErrorNotificationMock = jest.fn();

    loggerStub = {
      error: jest.fn(),
      debug: noop,
      info: noop,
      silly: noop,
      warn: noop,
    };

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(readYamlFileInjectable, () => readYamlFileMock);
      mainDi.override(execFileInjectable, () => execFileMock);
      mainDi.override(helmBinaryPathInjectable, () => "some-helm-binary-path");
      mainDi.override(loggerInjectionToken, () => loggerStub);
    });

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(showErrorNotificationInjectable, () => showErrorNotificationMock);
      windowDi.override(requestPublicHelmRepositoriesInjectable, () => async () => []);
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

    it("shows loader for repositories", () => {
      expect(
        rendered.getByTestId("helm-repositories-are-loading"),
      ).toBeInTheDocument();
    });

    it("calls for helm configuration", () => {
      expect(execFileMock).toHaveBeenCalledWith(
        "some-helm-binary-path",
        ["env"],
        {
          maxBuffer: 34359738368,
          env: {},
        },
      );
    });

    it("does not call for updating of repositories yet", () => {
      expect(execFileMock).not.toHaveBeenCalledWith(
        "some-helm-binary-path",
        ["repo", "update"],
        {
          maxBuffer: 34359738368,
          env: {},
        },
      );
    });

    describe("when getting configuration rejects", () => {
      beforeEach(async () => {
        await execFileMock.resolve({
          callWasSuccessful: false,
          error: Object.assign(new Error("Some error"), {
            stderr: "some-error",
          }),
        });
      });

      it("shows error notification", () => {
        expect(showErrorNotificationMock).toHaveBeenCalledWith(
          "Error getting Helm configuration: some-error",
        );
      });

      it("removes all helm controls", () => {
        expect(
          rendered.queryByTestId("helm-controls"),
        ).not.toBeInTheDocument();
      });

      it("does not show loader for repositories anymore", () => {
        expect(
          rendered.queryByTestId("helm-repositories-are-loading"),
        ).not.toBeInTheDocument();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe("when configuration resolves without path to repository config file", () => {
      beforeEach(async () => {
        execFileMock.mockClear();

        await execFileMock.resolveSpecific(
          ["some-helm-binary-path", ["env"]],
          {
            callWasSuccessful: true,
            response: "HELM_REPOSITORY_CACHE=some-helm-repository-cache-path",
          },
        );
      });

      it("logs error", () => {
        expect(loggerStub.error).toHaveBeenCalledWith(
          "Tried to get Helm repositories, but HELM_REPOSITORY_CONFIG was not present in `$ helm env`.",
        );
      });

      it("shows error notification", () => {
        expect(showErrorNotificationMock).toHaveBeenCalledWith(
          "Error getting Helm configuration: Tried to get Helm repositories, but HELM_REPOSITORY_CONFIG was not present in `$ helm env`.",
        );
      });

      it("removes all helm controls", () => {
        expect(
          rendered.queryByTestId("helm-controls"),
        ).not.toBeInTheDocument();
      });

      it("does not show loader for repositories anymore", () => {
        expect(
          rendered.queryByTestId("helm-repositories-are-loading"),
        ).not.toBeInTheDocument();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe("when configuration resolves without path to repository cache directory", () => {
      beforeEach(async () => {
        execFileMock.mockClear();

        await execFileMock.resolveSpecific(
          ["some-helm-binary-path", ["env"]],
          {
            callWasSuccessful: true,
            response: "HELM_REPOSITORY_CONFIG=some-helm-repository-config-file.yaml",
          },
        );
      });

      it("logs error", () => {
        expect(loggerStub.error).toHaveBeenCalledWith(
          "Tried to get Helm repositories, but HELM_REPOSITORY_CACHE was not present in `$ helm env`.",
        );
      });

      it("shows error notification", () => {
        expect(showErrorNotificationMock).toHaveBeenCalledWith(
          "Error getting Helm configuration: Tried to get Helm repositories, but HELM_REPOSITORY_CACHE was not present in `$ helm env`.",
        );
      });

      it("removes all helm controls", () => {
        expect(
          rendered.queryByTestId("helm-controls"),
        ).not.toBeInTheDocument();
      });

      it("does not show loader for repositories anymore", () => {
        expect(
          rendered.queryByTestId("helm-repositories-are-loading"),
        ).not.toBeInTheDocument();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });
    });

    describe("when configuration resolves", () => {
      beforeEach(async () => {
        execFileMock.mockClear();

        await execFileMock.resolveSpecific(
          ["some-helm-binary-path", ["env"]],
          {
            callWasSuccessful: true,
            response: [
              "HELM_REPOSITORY_CONFIG=some-helm-repository-config-file.yaml",
              "HELM_REPOSITORY_CACHE=some-helm-repository-cache-path",
            ].join("\n"),
          },
        );
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("calls for update of repositories", () => {
        expect(execFileMock).toHaveBeenCalledWith(
          "some-helm-binary-path",
          ["repo", "update"],
          {
            maxBuffer: 34359738368,
            env: {},
          },
        );
      });

      it("does not call for repositories yet", () => {
        expect(readYamlFileMock).not.toHaveBeenCalled();
      });

      describe("when updating repositories reject with any other error", () => {
        beforeEach(async () => {
          await execFileMock.resolve({
            callWasSuccessful: false,
            error: Object.assign(new Error("Some error"), {
              stderr: "Some error",
            }),
          });
        });

        it("shows error notification", () => {
          expect(showErrorNotificationMock).toHaveBeenCalledWith(
            "Error updating Helm repositories: Some error",
          );
        });

        it("removes all helm controls", () => {
          expect(
            rendered.queryByTestId("helm-controls"),
          ).not.toBeInTheDocument();
        });

        it("does not show loader for repositories anymore", () => {
          expect(
            rendered.queryByTestId("helm-repositories-are-loading"),
          ).not.toBeInTheDocument();
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });
      });

      describe("when updating repositories reject with error about no existing repositories", () => {
        beforeEach(async () => {
          execFileMock.mockClear();

          await execFileMock.resolve({
            callWasSuccessful: false,
            error: Object.assign(new Error("no repositories found. You must add one before updating"), {
              stderr: "no repositories found. You must add one before updating",
            }),
          });
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("still shows the loader for repositories", () => {
          expect(
            rendered.queryByTestId("helm-repositories-are-loading"),
          ).toBeInTheDocument();
        });

        it('adds "bitnami" as default repository', () => {
          expect(execFileMock).toHaveBeenCalledWith(
            "some-helm-binary-path",
            ["repo", "add", "bitnami", "https://charts.bitnami.com/bitnami"],
            {
              maxBuffer: 34359738368,
              env: {},
            },
          );
        });

        describe("when adding default repository reject", () => {
          beforeEach(async () => {
            await execFileMock.resolve({
              callWasSuccessful: false,
              error: Object.assign(new Error("Some error"), {
                stderr: "Some error",
              }),
            });
          });

          it("shows error notification", () => {
            expect(showErrorNotificationMock).toHaveBeenCalledWith(
              "Error when adding default Helm repository: Some error",
            );
          });

          it("removes all helm controls", () => {
            expect(
              rendered.queryByTestId("helm-controls"),
            ).not.toBeInTheDocument();
          });

          it("does not show loader for repositories anymore", () => {
            expect(
              rendered.queryByTestId("helm-repositories-are-loading"),
            ).not.toBeInTheDocument();
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });
        });

        describe("when adding of default repository resolves", () => {
          beforeEach(async () => {
            readYamlFileMock.mockClear();

            await execFileMock.resolveSpecific(
              [
                "some-helm-binary-path",
                [
                  "repo",
                  "add",
                  "bitnami",
                  "https://charts.bitnami.com/bitnami",
                ],
              ],
              {
                callWasSuccessful: true,
                response: "",
              },
            );
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("still shows the loader for repositories", () => {
            expect(
              rendered.queryByTestId("helm-repositories-are-loading"),
            ).toBeInTheDocument();
          });

          it("calls for repositories again", () => {
            expect(readYamlFileMock).toHaveBeenCalledWith(
              "some-helm-repository-config-file.yaml",
            );
          });

          describe("when another call for repositories resolve", () => {
            beforeEach(async () => {
              await readYamlFileMock.resolveSpecific(
                ["some-helm-repository-config-file.yaml"],

                {
                  repositories: [
                    {
                      name: "bitnami",
                      url: "https://charts.bitnami.com/bitnami",
                      caFile: "irrelevant",
                      certFile: "irrelevant",
                      insecure_skip_tls_verify: false,
                      keyFile: "irrelevant",
                      pass_credentials_all: false,
                      password: "irrelevant",
                      username: "irrelevant",
                    },
                  ],
                },
              );
            });

            it("does not show loader for repositories anymore", () => {
              expect(
                rendered.queryByTestId("helm-repositories-are-loading"),
              ).not.toBeInTheDocument();
            });

            it("shows the added repository", () => {
              const actual = rendered.getByTestId("helm-repository-bitnami");

              expect(actual).toBeInTheDocument();
            });
          });
        });
      });

      describe("when updating repositories resolve", () => {
        beforeEach(async () => {
          execFileMock.mockClear();

          await execFileMock.resolveSpecific(
            ["some-helm-binary-path", ["repo", "update"]],
            {
              callWasSuccessful: true,
              response: "",
            },
          );
        });

        it("loads repositories from file system", () => {
          expect(readYamlFileMock).toHaveBeenCalledWith(
            "some-helm-repository-config-file.yaml",
          );
        });

        describe("when repositories resolves", () => {
          beforeEach(async () => {
            execFileMock.mockClear();

            await readYamlFileMock.resolveSpecific(
              ["some-helm-repository-config-file.yaml"],
              repositoryConfigStub,
            );
          });

          it("does not add default repository", () => {
            expect(execFileMock).not.toHaveBeenCalledWith(
              "some-helm-binary-path",
              ["repo", "add", "bitnami", "https://charts.bitnami.com/bitnami"],
              {
                maxBuffer: 34359738368,
                env: {},
              },
            );
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("does not show loader for repositories anymore", () => {
            expect(
              rendered.queryByTestId("helm-repositories-are-loading"),
            ).not.toBeInTheDocument();
          });

          it("shows repositories in use", () => {
            const actual = rendered.getAllByTestId(
              /^helm-repository-(some-repository|some-other-repository)$/,
            );

            expect(actual).toHaveLength(2);
          });
        });
      });
    });
  });
});

const repositoryConfigStub: HelmRepositoriesFromYaml = {
  repositories: [
    {
      name: "some-repository",
      url: "some-repository-url",
      caFile: "irrelevant",
      certFile: "irrelevant",
      insecure_skip_tls_verify: false,
      keyFile: "irrelevant",
      pass_credentials_all: false,
      password: "irrelevant",
      username: "irrelevant",
    },

    {
      name: "some-other-repository",
      url: "some-other-repository-url",
      caFile: "irrelevant",
      certFile: "irrelevant",
      insecure_skip_tls_verify: false,
      keyFile: "irrelevant",
      pass_credentials_all: false,
      password: "irrelevant",
      username: "irrelevant",
    },
  ],
};
