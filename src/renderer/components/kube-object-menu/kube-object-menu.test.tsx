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
import { KubeObjectMenu } from "./kube-object-menu";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import userEvent from "@testing-library/user-event";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import type {
  IHasGettableItemsForKind,
  KubeObjectMenuRegistration,
} from "../../../extensions/registries";
import type { IGettableStore } from "../../../common/k8s-api/api-manager";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { IHasName } from "../../../main/cluster";
import { ConfirmDialog } from "../confirm-dialog";
import asyncFn from "@async-fn/jest";

describe("kube-object-menu", () => {
  let hideDetailsStub: () => void;
  let editResourceTabStub: () => void;
  let apiManagerStub: IGettableStore;
  let clusterStub: IHasName;
  let kubeObjectMenuRegistryStub: IHasGettableItemsForKind;
  let objectStub: KubeObject | null;

  beforeEach(() => {
    // TODO: Remove illegal global overwrites for what should be a dependency somewhere.
    // TODO: Remove usage of experimental browser API.
    window.requestIdleCallback = (callback: IdleRequestCallback): number => {
      callback(undefined);

      return undefined;
    };

    window.cancelIdleCallback = () => {};

    apiManagerStub = {
      // eslint-disable-next-line unused-imports/no-unused-vars-ts

      getStore: <TKubeObjectStore extends KubeObjectStore<KubeObject>>(
        api: string | KubeApi<KubeObject>,
      ): TKubeObjectStore | undefined => undefined,
    };

    clusterStub = { name: "Some cluster name" };

    const MenuItemComponentStub: React.FC = () => <div>Some menu item</div>;

    const dynamicMenuItemStub: KubeObjectMenuRegistration = {
      apiVersions: ["irrelevant"],
      components: { MenuItem: MenuItemComponentStub },
      kind: "irrelevant",
    };

    kubeObjectMenuRegistryStub = {
      // eslint-disable-next-line unused-imports/no-unused-vars-ts
      getItemsForKind: (kind: string, apiVersion: string): any => [
        dynamicMenuItemStub,
      ],
    };

    hideDetailsStub = () => {};

    editResourceTabStub = () => {};
  });

  it("given no kube object, renders", () => {
    objectStub = null;

    const { baseElement } = render(
      <KubeObjectMenu
        object={objectStub}
        apiManager={apiManagerStub}
        cluster={clusterStub}
        kubeObjectMenuRegistry={kubeObjectMenuRegistryStub}
        hideDetails={hideDetailsStub}
        editResourceTab={editResourceTabStub}
        toolbar={true}
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
        },
      });

      removeActionMock = asyncFn();

      ({ baseElement, getByTestId, queryByTestId } = render(
        <div>
          <ConfirmDialog/>

          <KubeObjectMenu
            object={objectStub}
            apiManager={apiManagerStub}
            cluster={clusterStub}
            kubeObjectMenuRegistry={kubeObjectMenuRegistryStub}
            hideDetails={hideDetailsStub}
            editResourceTab={editResourceTabStub}
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

          expect(queryByTestId("confirmation-dialog")).toBeNull();        });
      });
    });
  });
});
