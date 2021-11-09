/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { KubeObjectMenu, KubeObjectMenuDependencies } from "./kube-object-menu";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import userEvent from "@testing-library/user-event";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import type { KubeObjectMenuRegistration } from "../../../extensions/registries";
import type { IGettableStore } from "../../../common/k8s-api/api-manager";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { ConfirmDialog } from "../confirm-dialog";
import asyncFn from "@async-fn/jest";
import { KubeObjectMenuRegistry } from "../../../extensions/registries";

describe("kube-object-menu", () => {
  let hideDetailsStub: () => void;
  let editResourceTabStub: () => void;
  let apiManagerStub: IGettableStore;
  let kubeObjectMenuRegistry: KubeObjectMenuRegistry;
  let objectStub: KubeObject | null;
  let dependencies: KubeObjectMenuDependencies<KubeObject>;

  beforeEach(() => {
    // TODO: Remove illegal global overwrites for what should be a dependency somewhere.
    // TODO: Remove usage of experimental browser API.
    window.requestIdleCallback = (callback: IdleRequestCallback): number => {
      callback(undefined);

      return undefined;
    };

    window.cancelIdleCallback = () => {};

    apiManagerStub = {
      getStore: <TKubeObjectStore extends KubeObjectStore<KubeObject>>(
        // eslint-disable-next-line unused-imports/no-unused-vars-ts
        api: string | KubeApi<KubeObject>,
      ): TKubeObjectStore | undefined => undefined,
    };

    // TODO: Remove global shared state
    KubeObjectMenuRegistry.resetInstance();
    KubeObjectMenuRegistry.createInstance();
    kubeObjectMenuRegistry = KubeObjectMenuRegistry.getInstance();

    const MenuItemComponent: React.FC = () => <li>Some menu item</li>;

    addDynamicMenuItem({
      kubeObjectMenuRegistry,
      MenuItemComponent,
      apiVersions: ["some-api-version"],
      kind: "some-kind",
    });

    addDynamicMenuItem({
      kubeObjectMenuRegistry,
      MenuItemComponent,
      apiVersions: ["some-unrelated-api-version"],
      kind: "some-kind",
    });

    addDynamicMenuItem({
      kubeObjectMenuRegistry,
      MenuItemComponent,
      apiVersions: ["some-api-version"],
      kind: "some-unrelated-kind",
    });

    hideDetailsStub = () => {};

    editResourceTabStub = () => {};

    dependencies = {
      clusterName: "Some cluster name",
      apiManager: apiManagerStub,
      kubeObjectMenuRegistry,
      hideDetails: hideDetailsStub,
      editResourceTab: editResourceTabStub,
    };
  });

  it("given no kube object, renders", () => {
    objectStub = null;

    const { baseElement } = render(
      <KubeObjectMenu
        object={objectStub}
        toolbar={true}
        dependencies={dependencies}
      />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  describe("given kube object", () => {
    let baseElement: Element;
    let removeActionMock: any;
    let getByTestId: (arg0: string) => any;
    let queryByTestId: (arg0: string) => any;

    beforeEach(async () => {
      objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: "some-namespace",
        },
      });

      removeActionMock = asyncFn();

      ({ baseElement, getByTestId, queryByTestId } = render(
        <div>
          <ConfirmDialog />

          <KubeObjectMenu
            object={objectStub}
            dependencies={dependencies}
            toolbar={true}
            removeAction={removeActionMock}
          />
        </div>,
      ));
    });

    it("renders", () => {
      expect(baseElement).toMatchSnapshot();
    });

    it("does not open a confirmation dialog yet", () => {
      expect(queryByTestId("confirmation-dialog")).toBeNull();
    });

    describe("when removing kube object", () => {
      beforeEach(() => {
        const menuItem = getByTestId("menu-action-remove");

        userEvent.click(menuItem);
      });

      it("renders", () => {
        expect(baseElement).toMatchSnapshot();
      });

      it("opens a confirmation dialog", () => {
        getByTestId("confirmation-dialog");
      });

      describe("when remove is confirmed", () => {
        beforeEach(() => {
          const confirmRemovalButton = getByTestId("confirm");

          userEvent.click(confirmRemovalButton);
        });

        it("calls for removal of the kube object", () => {
          expect(removeActionMock).toHaveBeenCalledWith();
        });

        it("does not close the confirmation dialog yet", () => {
          getByTestId("confirmation-dialog");
        });

        it("when removal resolves, closes the confirmation dialog", async () => {
          await removeActionMock.resolve();

          expect(queryByTestId("confirmation-dialog")).toBeNull();
        });
      });
    });
  });

  describe("given kube object with namespace", () => {
    let baseElement: Element;
    let getByTestId: (arg0: string) => any;

    beforeEach(async () => {
      objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: "some-namespace",
        },
      });

      ({ baseElement, getByTestId } = render(
        <div>
          <ConfirmDialog />

          <KubeObjectMenu
            object={objectStub}
            dependencies={dependencies}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog with namespace", () => {
      const menuItem = getByTestId("menu-action-remove");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe("given kube object without namespace", () => {
    let baseElement: Element;
    let getByTestId: (arg0: string) => any;

    beforeEach(async () => {
      objectStub = KubeObject.create({
        apiVersion: "some-api-version",
        kind: "some-kind",
        metadata: {
          uid: "some-uid",
          name: "some-name",
          resourceVersion: "some-resource-version",
          namespace: undefined,
        },
      });

      ({ baseElement, getByTestId } = render(
        <div>
          <ConfirmDialog />

          <KubeObjectMenu
            object={objectStub}
            dependencies={dependencies}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog without namespace", () => {
      const menuItem = getByTestId("menu-action-remove");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });
});

const addDynamicMenuItem = ({
  kubeObjectMenuRegistry,
  MenuItemComponent,
  apiVersions,
  kind,
}: {
  kubeObjectMenuRegistry: KubeObjectMenuRegistry;
  MenuItemComponent: React.ComponentType;
  apiVersions: string[];
  kind: string;
}) => {
  const dynamicMenuItemStub: KubeObjectMenuRegistration = {
    apiVersions,
    kind,
    components: { MenuItem: MenuItemComponent },
  };

  kubeObjectMenuRegistry.add(dynamicMenuItemStub);
};
