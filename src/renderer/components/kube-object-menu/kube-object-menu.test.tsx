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
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import userEvent from "@testing-library/user-event";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import type { KubeObjectMenuRegistration } from "../../../extensions/registries";
import { KubeObjectMenuRegistry } from "../../../extensions/registries";
import { ConfirmDialog } from "../confirm-dialog";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { getDiForUnitTesting } from "../getDiForUnitTesting";

import clusterInjectable from "./dependencies/cluster.injectable";
import hideDetailsInjectable from "./dependencies/hide-details.injectable";
import editResourceTabInjectable from "../dock/edit-resource-tab/edit-resource-tab.injectable";
import { TabKind } from "../dock/dock-store/dock.store";
import kubeObjectMenuRegistryInjectable from "./dependencies/kube-object-menu-items/kube-object-menu-registry.injectable";
import { DiRender, renderFor } from "../test-utils/renderFor";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import apiManagerInjectable from "./dependencies/api-manager.injectable";
import { KubeObjectMenu } from "./index";

// TODO: Make tooltips free of side effects by making it deterministic
jest.mock("../tooltip");

describe("kube-object-menu", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();

    // TODO: Remove global shared state
    KubeObjectMenuRegistry.resetInstance();
    KubeObjectMenuRegistry.createInstance();

    render = renderFor(di);

    di.override(clusterInjectable, () => ({
      name: "Some name",
    }) as Cluster);

    di.override(apiManagerInjectable, () => ({
      // eslint-disable-next-line unused-imports/no-unused-vars-ts
      getStore: api => undefined,
    }) as ApiManager);

    di.override(hideDetailsInjectable, () => () => {});

    di.override(editResourceTabInjectable, () => () => ({
      id: "irrelevant",
      kind: TabKind.TERMINAL,
      pinned: false,
      title: "irrelevant",
    }));

    addDynamicMenuItem({
      di,
      apiVersions: ["some-api-version"],
      kind: "some-kind",
    });

    addDynamicMenuItem({
      di,
      apiVersions: ["some-unrelated-api-version"],
      kind: "some-kind",
    });

    addDynamicMenuItem({
      di,
      apiVersions: ["some-api-version"],
      kind: "some-unrelated-kind",
    });
  });

  it("given no cluster, does not crash", () => {
    di.override(clusterInjectable, () => null);

    expect(() => {
      render(<KubeObjectMenu object={null} toolbar={true} />);
    }).not.toThrow();
  });

  it("given no kube object, renders", () => {
    const { baseElement } = render(
      <KubeObjectMenu object={null} toolbar={true} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  describe("given kube object", () => {
    let baseElement: Element;
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
        },
      });

      removeActionMock = asyncFn();

      ({ baseElement } = render(
        <div>
          <ConfirmDialog />

          <KubeObjectMenu
            object={objectStub}
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
      expect(screen.queryByTestId("confirmation-dialog")).toBeNull();
    });

    describe("when removing kube object", () => {
      beforeEach(() => {
        const menuItem = screen.getByTestId("menu-action-remove");

        userEvent.click(menuItem);
      });

      it("renders", () => {
        expect(baseElement).toMatchSnapshot();
      });

      it("opens a confirmation dialog", () => {
        screen.getByTestId("confirmation-dialog");
      });

      describe("when remove is confirmed", () => {
        beforeEach(() => {
          const confirmRemovalButton = screen.getByTestId("confirm");

          userEvent.click(confirmRemovalButton);
        });

        it("calls for removal of the kube object", () => {
          expect(removeActionMock).toHaveBeenCalledWith();
        });

        it("does not close the confirmation dialog yet", () => {
          screen.getByTestId("confirmation-dialog");
        });

        it("when removal resolves, closes the confirmation dialog", async () => {
          await removeActionMock.resolve();

          expect(screen.queryByTestId("confirmation-dialog")).toBeNull();
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
        },
      });

      ({ baseElement } = render(
        <div>
          <ConfirmDialog />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog with namespace", () => {
      const menuItem = screen.getByTestId("menu-action-remove");

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
        },
      });

      ({ baseElement } = render(
        <div>
          <ConfirmDialog />

          <KubeObjectMenu
            object={objectStub}
            toolbar={true}
            removeAction={() => {}}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog without namespace", () => {
      const menuItem = screen.getByTestId("menu-action-remove");

      userEvent.click(menuItem);

      expect(baseElement).toMatchSnapshot();
    });
  });
});

const addDynamicMenuItem = ({
  di,
  apiVersions,
  kind,
}: {
  di: ConfigurableDependencyInjectionContainer;
  apiVersions: string[];
  kind: string;
}) => {
  const MenuItemComponent: React.FC = () => <li>Some menu item</li>;

  const dynamicMenuItemStub: KubeObjectMenuRegistration = {
    apiVersions,
    kind,
    components: { MenuItem: MenuItemComponent },
  };

  const kubeObjectMenuRegistry = di.inject(kubeObjectMenuRegistryInjectable);

  kubeObjectMenuRegistry.add(dynamicMenuItemStub);
};
