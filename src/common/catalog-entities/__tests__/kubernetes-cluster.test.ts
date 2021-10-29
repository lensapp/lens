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
import { kubernetesClusterCategory }  from "../kubernetes-cluster";

describe("kubernetesClusterCategory", () => {
  describe("filteredItems", () => {
    const item1 = {
      icon: "Icon",
      title: "Title",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick: () => {},
    };
    const item2 = {
      icon: "Icon 2",
      title: "Title 2",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick: () => {},
    };

    it("returns all items if no filter set", () => {
      expect(kubernetesClusterCategory.filteredItems([item1, item2])).toEqual([item1, item2]);
    });

    it("returns filtered items", () => {
      expect(kubernetesClusterCategory.filteredItems([item1, item2])).toEqual([item1, item2]);

      const disposer1 = kubernetesClusterCategory.addMenuFilter(item => item.icon === "Icon");

      expect(kubernetesClusterCategory.filteredItems([item1, item2])).toEqual([item1]);

      const disposer2 = kubernetesClusterCategory.addMenuFilter(item => item.title === "Title 2");

      expect(kubernetesClusterCategory.filteredItems([item1, item2])).toEqual([]);

      disposer1();

      expect(kubernetesClusterCategory.filteredItems([item1, item2])).toEqual([item2]);

      disposer2();

      expect(kubernetesClusterCategory.filteredItems([item1, item2])).toEqual([item1, item2]);
    });
  });
});
