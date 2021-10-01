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
import { Catalog } from "./catalog";
import { createMemoryHistory } from "history";
import { mockWindow } from "../../../../__mocks__/windowMock";
import { kubernetesClusterCategory } from "../../../common/catalog-entities/kubernetes-cluster";
import { catalogCategoryRegistry } from "../../../common/catalog";

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
 
describe("<Catalog />", () => { 
  afterEach(() => {
    jest.restoreAllMocks();
  });
 
  it("category.emit('catalogAddMenu') when '+' button renders", (done) => {
    const history = createMemoryHistory();
    const mockLocation = {
      pathname: "",
      search: "",
      state: "",
      hash: "",
    };
    const mockMatch = {
      params: {
        // will be used to match activeCategory
        // need to be the same as property values in kubernetesClusterCategory
        group: "entity.k8slens.dev",
        kind: "KubernetesCluster",
      },
      isExact: true,
      path: "",
      url: "",
    };

    let called = 0;

    jest.spyOn(kubernetesClusterCategory, "emit").mockImplementation((event, context) => {
      // const spy = jest.spyOn(kubernetesClusterCategory, "emit")
      // expect(spy).toHaveBeenCalledTimes(1);
      // ^ doesn't work because of using EventEmitter.emit
      // we have to do this way.
      called = 1;
      expect(called).toBe(1);
      expect(event === "load" || event === "catalogAddMenu").toBeTruthy();

      // only event "catalogAddMenu" has context
      if (context) {
        expect(typeof context.navigate).toBe("function");
        expect(Array.isArray(context.menuItems)).toBeTruthy();
      }

      if (event === "catalogAddMenu") {
        done();
      }

      return true;
    });

    // mock the return of getting CatalogCategoryRegistry.filteredItems
    jest
      .spyOn(catalogCategoryRegistry, "filteredItems", "get")
      .mockImplementation(() => {
        return [kubernetesClusterCategory];
      });

    // we don't care what this.renderList renders in this test case.
    jest.spyOn(Catalog.prototype, "renderList").mockImplementation(() => {
      return <span>empty renderList</span>;
    });
 
    render(
      <Catalog history={history} location={mockLocation} match={mockMatch} />
    );
  });
});
 
