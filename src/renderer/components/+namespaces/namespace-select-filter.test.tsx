/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import React from "react";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { Namespace } from "../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
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
  let result: RenderResult;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    di.override(directoryForUserDataInjectable, () => "/some-directory");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    namespaceStore = di.inject(namespaceStoreInjectable);

    const render = renderFor(di);

    namespaceStore.items.replace([
      createNamespace("default"),
      createNamespace("kube-system"),
      createNamespace("kube-system-2"),
    ]);

    result = render((
      <NamespaceSelectFilter id="namespace-select-filter" />
    ));
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

    describe("when 'kube-system' is clicked", () => {
      beforeEach(() => {
        result.getByText("kube-system").click();
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("has only 'kube-system' is selected in the store", () => {
        expect(namespaceStore.contextNamespaces).toEqual(["kube-system"]);
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

        it("shows 'kube-system' as selected", () => {
          expect(result.queryByTestId("namespace-select-filter-option-kube-system-selected")).not.toBeNull();
        });

        it("does not show 'default' as selected", () => {
          expect(result.queryByTestId("namespace-select-filter-option-default-selected")).toBeNull();
        });

        describe("when 'default' is clicked", () => {
          beforeEach(() => {
            result.getByText("default").click();
          });

          it("renders", () => {
            expect(result.baseElement).toMatchSnapshot();
          });

          it("has only 'default' is selected in the store", () => {
            expect(namespaceStore.contextNamespaces).toEqual(["default"]);
          });

          it("closes menu", () => {
            expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).toBeNull();
          });

          describe("when clicked again, then holding down multi select key, and then clicking 'kube-system-2'", () => {
            beforeEach(() => {
              const filter = result.getByTestId("namespace-select-filter");

              filter.click();
              fireEvent.keyDown(filter, { key: "Meta" });
            });

            describe("when 'kube-system-2' is clicked", () => {
              beforeEach(() => {
                result.getByText("kube-system-2").click();
              });

              it("renders", () => {
                expect(result.baseElement).toMatchSnapshot();
              });

              it("has both 'default' and 'kube-system-2' as selected in the store", () => {
                expect(new Set(namespaceStore.contextNamespaces)).toEqual(new Set(["default", "kube-system-2"]));
              });

              it("keeps menu open", () => {
                expect(result.baseElement.querySelector("#react-select-namespace-select-filter-listbox")).not.toBeNull();
              });

              it("does not show 'kube-system' as selected", () => {
                expect(result.queryByTestId("namespace-select-filter-option-kube-system-selected")).toBeNull();
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
  });
});
