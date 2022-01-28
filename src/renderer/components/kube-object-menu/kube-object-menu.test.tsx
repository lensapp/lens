/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import userEvent from "@testing-library/user-event";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { KubeObjectMenuRegistry } from "../../../extensions/registries";
import { ConfirmDialog } from "../confirm-dialog";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

import hideDetailsInjectable from "./dependencies/hide-details.injectable";
import { TabKind } from "../dock/store";
import kubeObjectMenuRegistryInjectable from "./dependencies/kube-object-menu-items/kube-object-menu-registry.injectable";
import { DiRender, renderFor } from "../test-utils/renderFor";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectMenu } from "./index";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import newEditResourceTabInjectable from "../dock/edit-resource/create-tab.injectable";
import uniqueIdInjectable from "../../../common/utils/unique-id.injectable";
import clusterNameInjectable from "./dependencies/cluster-name.injectable";

jest.mock("lodash/uniqueId", () => (val?: string) => val);

// TODO: Make tooltips free of side effects by making it deterministic
jest.mock("../tooltip");

describe("kube-object-menu", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();
    render = renderFor(di);

    // TODO: Remove global shared state
    KubeObjectMenuRegistry.resetInstance();
    KubeObjectMenuRegistry.createInstance();

    di.override(clusterNameInjectable, () => "Some name");
    di.override(apiManagerInjectable, () => ({
      getStore: api => void api,
    }) as ApiManager);

    di.override(uniqueIdInjectable, () => val => val);
    di.override(hideDetailsInjectable, () => () => { });

    di.override(newEditResourceTabInjectable, () => () => ({
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

  it("given no kube object, renders", () => {
    const { baseElement } = render(
      <KubeObjectMenu object={null} toolbar={true} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  describe("given kube object", () => {
    let baseElement: Element;
    let removeActionMock: AsyncFnMock<() => void>;

    beforeEach(() => {
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
      beforeEach(async () => {
        userEvent.click(await screen.findByTestId("menu-action-remove"));
      });

      it("renders", () => {
        expect(baseElement).toMatchSnapshot();
      });

      it("opens a confirmation dialog", async () => {
        await screen.findByTestId("confirmation-dialog");
      });

      describe("when remove is confirmed", () => {
        beforeEach(async () => {
          userEvent.click(await screen.findByTestId("confirm"));
        });

        it("calls for removal of the kube object", () => {
          expect(removeActionMock).toHaveBeenCalledWith();
        });

        it("does not close the confirmation dialog yet", async () => {
          await screen.findByTestId("confirmation-dialog");
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

    beforeEach(() => {
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
            removeAction={() => { }}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog with namespace", async () => {
      userEvent.click(await screen.findByTestId("menu-action-remove"));

      expect(baseElement).toMatchSnapshot();
    });
  });

  describe("given kube object without namespace", () => {
    let baseElement: Element;

    beforeEach(() => {
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
            removeAction={() => { }}
          />
        </div>,
      ));
    });

    it("when removing kube object, renders confirmation dialog without namespace", async () => {
      userEvent.click(await screen.findByTestId("menu-action-remove"));

      expect(baseElement).toMatchSnapshot();
    });
  });
});

function addDynamicMenuItem({
  di, apiVersions, kind,
}: {
  di: ConfigurableDependencyInjectionContainer;
  apiVersions: string[];
  kind: string;
}) {
  di.inject(kubeObjectMenuRegistryInjectable).add({
    apiVersions,
    kind,
    components: {
      MenuItem: () => <li>Some menu item</li>,
    },
  });
}
