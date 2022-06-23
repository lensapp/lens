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
import type { AsyncResult } from "../../common/utils/async-result";

// TODO: Make tooltips free of side effects by making it deterministic
jest.mock("../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip: (target: any) => target,
}));

describe("remove helm repository from list of active repositories in preferences", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;
  let getActiveHelmRepositoriesMock: AsyncFnMock<() => AsyncResult<HelmRepo[]>>;
  let execFileMock: AsyncFnMock<
    ReturnType<typeof execFileInjectable["instantiate"]>
  >;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    execFileMock = asyncFn();
    getActiveHelmRepositoriesMock = asyncFn();

    applicationBuilder.beforeApplicationStart(({ mainDi, rendererDi }) => {
      rendererDi.override(callForPublicHelmRepositoriesInjectable, () => async () => []);

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

    describe("when active repositories resolve", () => {
      beforeEach(async () => {
        getActiveHelmRepositoriesMock.resolve({
          callWasSuccessful: true,
          response: [
            { name: "some-active-repository", url: "some-url" },
          ],
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      describe("when removing repository", () => {
        beforeEach(() => {
          execFileMock.mockClear();
          getActiveHelmRepositoriesMock.mockClear();

          const removeButton = rendered.getByTestId(
            "remove-helm-repository-some-active-repository",
          );

          fireEvent.click(removeButton);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("removes the repository", () => {
          expect(execFileMock).toHaveBeenCalledWith(
            "some-helm-binary-path",
            ["repo", "remove", "some-active-repository"],
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
                ["repo", "remove", "some-active-repository"],
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
