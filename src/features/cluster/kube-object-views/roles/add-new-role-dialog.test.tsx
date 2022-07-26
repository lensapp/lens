/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { computed } from "mobx";
import type { PartialDeep } from "type-fest";
import { Role } from "../../../../common/k8s-api/endpoints";
import type { ResourceDescriptor } from "../../../../common/k8s-api/kube-api";
import namespacesInjectable from "../../../../renderer/components/+namespaces/namespaces.injectable";
import navigateToRolesViewInjectable from "../../../../renderer/components/+user-management/+roles/navigate-to.injectable";
import roleStoreInjectable from "../../../../renderer/components/+user-management/+roles/store.injectable";
import type { ShowDetails } from "../../../../renderer/components/kube-detail-params/show-details.injectable";
import showDetailsInjectable from "../../../../renderer/components/kube-detail-params/show-details.injectable";
import type { ShowNotification } from "../../../../renderer/components/notifications";
import showErrorNotificationInjectable from "../../../../renderer/components/notifications/show-error-notification.injectable";
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";

describe("Roles view/add new role dialog", () => {
  let applicationBuilder: ApplicationBuilder;
  let renderResult: RenderResult;
  let createRoleMock: AsyncFnMock<(params: ResourceDescriptor, data?: PartialDeep<Role>) => Promise<Role>>;
  let showDetailsMock: jest.MockedFunction<ShowDetails>;
  let showErrorNotificationMock: jest.MockedFunction<ShowNotification>;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();
    applicationBuilder.setEnvironmentToClusterFrame();
    applicationBuilder.allowKubeResource("roles");

    applicationBuilder.beforeWindowStart((windowDi) => {
      windowDi.override(namespacesInjectable, () => computed(() => (
        ["default", "my-namespace", "my-namespace-2"]
      )));

      createRoleMock = asyncFn();
      showDetailsMock = jest.fn();
      showErrorNotificationMock = jest.fn();
      windowDi.inject(roleStoreInjectable).create = createRoleMock;
      windowDi.override(showDetailsInjectable, () => showDetailsMock);
      windowDi.override(showErrorNotificationInjectable, () => showErrorNotificationMock);

      windowDi.inject(navigateToRolesViewInjectable)();
    });

    renderResult = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(renderResult.baseElement).toMatchSnapshot();
  });

  it("does not show the add role dialog yet", () => {
    expect(renderResult.queryByTestId("add-role-dialog")).not.toBeInTheDocument();
  });

  describe("when add new role button is clicked", () => {
    beforeEach(() => {
      renderResult.getByTestId("roles-view-add-button").click();
    });

    it("renders", () => {
      expect(renderResult.baseElement).toMatchSnapshot();
    });

    it("shows the add role dialog", () => {
      expect(renderResult.queryByTestId("add-role-dialog")).toBeInTheDocument();
    });

    it("create role button is disabled", () => {
      expect(renderResult.getByTestId("add-role-dialog-create-step")).toBeDisabled();
    });

    describe("with name inputed", () => {
      beforeEach(() => {
        userEvent.type(
          renderResult.getByTestId("add-role-dialog-name-input"),
          "my-role-name",
        );
      });

      it("renders", () => {
        expect(renderResult.baseElement).toMatchSnapshot();
      });

      it("create role button is disabled", () => {
        expect(renderResult.getByTestId("add-role-dialog-create-step")).toBeDisabled();
      });

      describe("with namespace selected", () => {
        beforeEach(() => {
          applicationBuilder.select
            .openMenu("add-dialog-namespace-select-input")
            .selectOption("default");
        });

        it("renders", () => {
          expect(renderResult.baseElement).toMatchSnapshot();
        });

        it("create role button is enabled", () => {
          expect(renderResult.getByTestId("add-role-dialog-create-step")).toBeEnabled();
        });

        describe("when create button is clicked", () => {
          beforeEach(() => {
            renderResult.getByTestId("add-role-dialog-create-step").click();
          });

          it("renders", () => {
            expect(renderResult.baseElement).toMatchSnapshot();
          });

          it("calls roleStore.create", () => {
            expect(createRoleMock).toBeCalledWith({
              name: "my-role-name",
              namespace: "default",
            });
          });

          it("still shows the dialog", () => {
            expect(renderResult.queryByTestId("add-role-dialog")).toBeInTheDocument();
          });

          it("shows the create button as loading", () => {
            expect(renderResult.getByTestId("add-role-dialog-create-step").getAttribute("data-waiting")).toBe("true");
          });

          describe("when roleStore.create resolves", () => {
            beforeEach(async () => {
              await createRoleMock.resolve(new Role({
                apiVersion: "rbac.authorization.k8s.io/v1",
                kind: "Role",
                metadata: {
                  name: "my-role-name",
                  namespace: "default",
                  resourceVersion: "1",
                  selfLink: "/apis/rbac.authorization.k8s.io/v1/role/default/my-role-name",
                  uid: "123",
                },
              }));
            });

            it("renders", () => {
              expect(renderResult.baseElement).toMatchSnapshot();
            });

            it("no longer shows the dialog", () => {
              expect(renderResult.queryByTestId("add-role-dialog")).not.toBeInTheDocument();
            });

            it("shows kube details", () => {
              expect(showDetailsMock).toBeCalledWith("/apis/rbac.authorization.k8s.io/v1/role/default/my-role-name");
            });
          });

          describe("when roleStore.create rejects", () => {
            beforeEach(async () => {
              await createRoleMock.reject("some-error");
            });

            it("renders", () => {
              expect(renderResult.baseElement).toMatchSnapshot();
            });

            it("still shows the dialog", () => {
              expect(renderResult.queryByTestId("add-role-dialog")).toBeInTheDocument();
            });

            it("no longer shows the create button as loading", () => {
              expect(renderResult.getByTestId("add-role-dialog-create-step").getAttribute("data-waiting")).toBe("false");
            });

            it("shows an error notification", () => {
              expect(showErrorNotificationMock).toBeCalledWith("some-error", undefined);
            });
          });
        });
      });
    });
  });
});
