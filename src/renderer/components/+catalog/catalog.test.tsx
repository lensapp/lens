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

import { CatalogEntityDetailRegistry } from "../../../extensions/registries";
import { mockWindow } from "../../../../__mocks__/windowMock";
import {
  KubernetesCluster,
} from "../../../common/catalog-entities/kubernetes-cluster";
import { CatalogEntityItem } from "./catalog-entity-item";
import { CatalogEntityStore } from "./catalog-entity.store";

mockWindow();

// avoid TypeError: Cannot read property 'getPath' of undefined
jest.mock("@electron/remote", () => {
  return {
    app: {
      getPath: () => {
        // avoid TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined
        return "";
      },
    },
  };
});

// avoid crashese in <CatalogMenu />
jest.mock("../../api/catalog-category-registry", () => {
  return {
    catalogCategoryRegistry: {
      filteredItems: [],
    },
  };
});

describe("<Catalog />", () => {
  beforeEach(() => {
    CatalogEntityDetailRegistry.createInstance();
  });

  beforeAll(() => {
    // mock the return of getting CatalogEntityStore.selectedItem
    jest
      .spyOn(CatalogEntityStore.prototype, "selectedItem", "get")
      .mockImplementation(() => {
        const mockCluster = new KubernetesCluster({
          metadata: {
            uid: "",
            name: "",
            source: "",
            labels: {},
            distro: "",
            kubeVersion: "",
          },
          spec: {
            kubeconfigPath: "",
            kubeconfigContext: "",
            icon: {},
          },
          status: {
            phase: "disconnected",
            reason: "",
            message: "",
            active: false,
          },
        });

        const entityItem = new CatalogEntityItem(mockCluster);

        return entityItem;
      });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
