/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import userEvent from "@testing-library/user-event";
import { getInjectable } from "@ogre-tools/injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { ConfirmDialog } from "../confirm-dialog";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { computed, runInAction } from "mobx";
import clusterInjectable from "./dependencies/cluster.injectable";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import { KubeObjectMenu } from "./index";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";
import { kubeObjectMenuItemInjectionToken } from "./kube-object-menu-item-injection-token";

// TODO: make `animated={false}` not required to make tests deterministic
describe("kube-object-menu", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    runInAction(() => {
      di.register(
        someMenuItemInjectable,
        someOtherMenuItemInjectable,
        someAnotherMenuItemInjectable,
      );
    });

    render = renderFor(di);

    di.override(
      clusterInjectable,
      () =>
        ({
          name: "Some name",
        } as Cluster),
    );

    di.override(
      apiManagerInjectable,
      () =>
        ({
          getStore: (api: any) => void api,
        } as ApiManager),
    );

    di.override(hideDetailsInjectable, () => () => {});

    di.override(createEditResourceTabInjectable, () => () => "irrelevant");
  });

  it("given no cluster, does not crash", () => {
    di.override(clusterInjectable, () => null);

    expect(() => {
      render(<KubeObjectMenu object={null as never} toolbar={true} />);
    }).not.toThrow();
  });

  it("given no kube object, renders", () => {
    const { baseElement } = render(
      <KubeObjectMenu object={null as never} toolbar={true} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  describe("given kube object", () => {
    let result: RenderResult;
    let removeActionMock: AsyncFnMock<() => void>;

    beforeEach(async () => {
      const objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: "some-namespace",
          selfLink: "/foo",
        },
      });

      removeActionMock = asyncFn();
      result = render((
        <div>
          <ConfirmDialog animated={false} />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={removeActionMock}
          />
        </div>
      ));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("does not open a confirmation dialog yet", () => {
      expect(screen.queryByTestId("confirmation-dialog")).toBeNull();
    });

    describe("when rerendered with different kube object", () => {
      beforeEach(() => {
        const newObjectStub = KubeObject.create({
          apiVersion: "some-other-api-version",
          kind: "some-other-kind",
          metadata: {
            uid: "some-other-uid",
            name: "some-other-name",
            resourceVersion: "some-other-resource-version",
            namespace: "some-other-namespace",
            selfLink: "some-other-api-version/some-other-kind/some-other-namespace/some-other-name",
          },
        });

        result.rerender(
          <div>
            <ConfirmDialog animated={false} />

            <KubeObjectMenu
              object={newObjectStub}
              toolbar={true}
              removeAction={removeActionMock}
            />
          </div>,
        );
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      describe("when removing new kube object", () => {
        beforeEach(async () => {
          userEvent.click(await screen.findByTestId("menu-action-delete"));
        });

        it("renders", async () => {
          await screen.findByTestId("confirmation-dialog");
          expect(result.baseElement).toMatchSnapshot();
        });
      });
    });

    describe("when removing kube object", () => {
      beforeEach(async () => {
        userEvent.click(await screen.findByTestId("menu-action-delete"));
      });

      it("renders", async () => {
        await screen.findByTestId("confirmation-dialog");
        expect(result.baseElement).toMatchSnapshot();
      });

      describe("when remove is confirmed", () => {
        beforeEach(async () => {
          const confirmRemovalButton = await screen.findByTestId("confirm");

          userEvent.click(confirmRemovalButton);
        });

        it("calls for removal of the kube object", () => {
          expect(removeActionMock).toHaveBeenCalledWith();
        });

        it("does not close the confirmation dialog yet", async () => {
          await screen.findByTestId("confirmation-dialog");
        });

        it("when removal resolves, closes the confirmation dialog", async () => {
          await removeActionMock.resolve();
          await waitFor(() => {
            expect(screen.queryByTestId("confirmation-dialog")).toBeNull();
          });
        });
      });
    });
  });

  describe("given kube object with namespace", () => {
    let baseElement: Element;

    beforeEach(async () => {
      const objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: "some-namespace",
          selfLink: "/foo",
        },
      });

      ({ baseElement } = render(
        <div>
          <ConfirmDialog animated={false} />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog with namespace", async () => {
      const menuItem = await screen.findByTestId("menu-action-delete");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe("given kube object without namespace", () => {
    let baseElement: Element;

    beforeEach(async () => {
      const objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: undefined,
          selfLink: "/foo",
        },
      });

      ({ baseElement } = render(
        <div>
          <ConfirmDialog animated={false} />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog without namespace", async () => {
      const menuItem = await screen.findByTestId("menu-action-delete");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });
});

const MenuItemComponent = () => <li>Some menu item</li>;

const someMenuItemInjectable = getInjectable({
  id: "some-menu-item",

  instantiate: () => ({
    apiVersions: ["some-api-version"],
    kind: "some-kind",
    Component: MenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 1,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

const someOtherMenuItemInjectable = getInjectable({
  id: "some-other-menu-item",

  instantiate: () => ({
    apiVersions: ["some-unrelated-api-version"],
    kind: "some-kind",
    Component: MenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 1,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

const someAnotherMenuItemInjectable = getInjectable({
  id: "some-another-menu-item",

  instantiate: () => ({
    apiVersions: ["some-api-version"],
    kind: "some-unrelated-kind",
    Component: MenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 1,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});
