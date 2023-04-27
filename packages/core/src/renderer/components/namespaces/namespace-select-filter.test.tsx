/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import React from "react";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { Cluster } from "../../../common/cluster/cluster";
import type { Fetch } from "../../../common/fetch/fetch.injectable";
import fetchInjectable from "../../../common/fetch/fetch.injectable";
import { Namespace } from "@k8slens/kube-object";
import { createMockResponseFromString } from "../../../test-utils/mock-responses";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import type { Disposer } from "@k8slens/utilities";
import { disposer } from "@k8slens/utilities";
import { renderFor } from "../test-utils/renderFor";
import { NamespaceSelectFilter } from "./namespace-select-filter";
import type { NamespaceStore } from "./store";
import namespaceStoreInjectable from "./store.injectable";

function createNamespace(name: string): Namespace {
  return new Namespace({
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name,
      resourceVersion: "1",
      selfLink: `/api/v1/namespaces/${name}`,
      uid: `${name}-1`,
    },
  });
}

describe("<NamespaceSelectFilter />", () => {
  let di: DiContainer;
  let namespaceStore: NamespaceStore;
  let fetchMock: AsyncFnMock<Fetch>;
  let result: RenderResult;
  let cleanup: Disposer;

  beforeEach(() => {
    di = getDiForUnitTesting();
    di.unoverride(subscribeStoresInjectable);

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    namespaceStore = di.inject(namespaceStoreInjectable);

    const subscribeStores = di.inject(subscribeStoresInjectable);

    cleanup = disposer(subscribeStores([namespaceStore]));

    const render = renderFor(di);

    result = render((
      <NamespaceSelectFilter id="namespace-select-filter" />
    ));
  });

  afterEach(() => {
    cleanup();
  });

  describe("once the subscribe resolves", () => {
    beforeEach(async () => {
      await fetchMock.resolveSpecific([
        "https://127.0.0.1:12345/api-kube/api/v1/namespaces",
      ], createMockResponseFromString("https://127.0.0.1:12345/api-kube/api/v1/namespaces", JSON.stringify({
        apiVersion: "v1",
        kind: "NamespaceList",
        metadata: {},
        items: [
          createNamespace("test-1"),
          createNamespace("test-2"),
          createNamespace("test-3"),
          createNamespace("test-4"),
          createNamespace("test-5"),
          createNamespace("test-6"),
          createNamespace("test-7"),
          createNamespace("test-8"),
          createNamespace("test-9"),
          createNamespace("test-10"),
          createNamespace("test-11"),
          createNamespace("test-12"),
          createNamespace("test-13"),
        ],
      })));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    describe("when clicked", () => {
      beforeEach(() => {
        result.getByTestId("namespace-select-filter").click();
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("opens menu", () => {
        expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).not.toBeNull();
      });

      describe("when 'test-2' is clicked", () => {
        beforeEach(() => {
          result.getByText("test-2").click();
        });

        it("renders", () => {
          expect(result.baseElement).toMatchSnapshot();
        });

        it("has only 'test-2' is selected in the store", () => {
          expect(namespaceStore.contextNamespaces).toEqual(["test-2"]);
        });

        it("closes menu", () => {
          expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).toBeNull();
        });

        describe("when clicked again", () => {
          beforeEach(() => {
            result.getByTestId("namespace-select-filter").click();
          });

          it("renders", () => {
            expect(result.baseElement).toMatchSnapshot();
          });

          it("shows 'test-2' as selected", () => {
            expect(result.queryByTestId("namespace-select-filter-option-test-2-selected")).not.toBeNull();
          });

          it("does not show 'test-1' as selected", () => {
            expect(result.queryByTestId("namespace-select-filter-option-test-1-selected")).toBeNull();
          });

          describe("when 'test-1' is clicked", () => {
            beforeEach(() => {
              result.getByText("test-1").click();
            });

            it("renders", () => {
              expect(result.baseElement).toMatchSnapshot();
            });

            it("has only 'test-1' is selected in the store", () => {
              expect(namespaceStore.contextNamespaces).toEqual(["test-1"]);
            });

            it("closes menu", () => {
              expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).toBeNull();
            });

            describe("when clicked again, then holding down multi select key", () => {
              beforeEach(() => {
                const filter = result.getByTestId("namespace-select-filter");

                filter.click();
                fireEvent.keyDown(filter, { key: "Meta" });
              });

              describe("when 'test-3' is clicked", () => {
                beforeEach(() => {
                  result.getByText("test-3").click();
                });

                it("renders", () => {
                  expect(result.baseElement).toMatchSnapshot();
                });

                it("has both 'test-1' and 'test-3' as selected in the store", () => {
                  expect(new Set(namespaceStore.contextNamespaces)).toEqual(new Set(["test-1", "test-3"]));
                });

                it("keeps menu open", () => {
                  expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).not.toBeNull();
                });

                it("does not show 'kube-system' as selected", () => {
                  expect(result.queryByTestId("namespace-select-filter-option-kube-system-selected")).toBeNull();
                });

                describe("when 'test-13' is clicked", () => {
                  beforeEach(() => {
                    result.getByText("test-13").click();
                  });

                  it("has all of 'test-1', 'test-3', and 'test-13' selected in the store", () => {
                    expect(new Set(namespaceStore.contextNamespaces)).toEqual(new Set(["test-1", "test-3", "test-13"]));
                  });

                  it("'test-13' is not sorted to the top of the list", () => {
                    const topLevelElement = result.getByText("test-13").parentElement?.parentElement as HTMLElement;

                    expect(topLevelElement.previousSibling).not.toBe(null);
                  });
                });

                describe("when releasing multi select key", () => {
                  beforeEach(() => {
                    const filter = result.getByTestId("namespace-select-filter");

                    fireEvent.keyUp(filter, { key: "Meta" });
                  });

                  it("closes menu", () => {
                    expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).toBeNull();
                  });
                });
              });

              describe("when releasing multi select key", () => {
                beforeEach(() => {
                  const filter = result.getByTestId("namespace-select-filter");

                  fireEvent.keyUp(filter, { key: "Meta" });
                });

                it("keeps menu open", () => {
                  expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).not.toBeNull();
                });
              });
            });
          });
        });
      });

      describe("when multi-selection key is pressed", () => {
        beforeEach(() => {
          const filter = result.getByTestId("namespace-select-filter");

          fireEvent.keyDown(filter, { key: "Meta" });
        });

        it("should show placeholder text as 'All namespaces'", () => {
          expect(result.baseElement.querySelector("#react-select-namespace-select-filter-placeholder")).toHaveTextContent("All namespaces");
        });

        describe("when 'test-2' is clicked", () => {
          beforeEach(() => {
            result.getByText("test-2").click();
          });

          it("should not show placeholder text as 'All namespaces'", () => {
            expect(result.baseElement.querySelector("#react-select-namespace-select-filter-placeholder")).not.toHaveTextContent("All namespaces");
          });

          describe("when 'test-2' is clicked", () => {
            beforeEach(() => {
              result.getByText("test-2").click();
            });

            it("should not show placeholder as 'All namespaces'", () => {
              expect(result.baseElement.querySelector("#react-select-namespace-select-filter-placeholder")).not.toHaveTextContent("All namespaces");
            });

            describe("when multi-selection key is raised", () => {
              beforeEach(() => {
                const filter = result.getByTestId("namespace-select-filter");

                fireEvent.keyUp(filter, { key: "Meta" });
              });

              it("should show placeholder text as 'All namespaces'", () => {
                expect(result.baseElement.querySelector("#react-select-namespace-select-filter-placeholder")).not.toHaveTextContent("All namespaces");
              });
            });
          });
        });
      });
    });
  });
});
