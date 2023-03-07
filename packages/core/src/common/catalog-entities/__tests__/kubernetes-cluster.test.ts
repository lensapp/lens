/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import kubernetesClusterCategoryInjectable from "../../catalog/categories/kubernetes-cluster.injectable";
import type { KubernetesClusterCategory } from "../kubernetes-cluster";


describe("kubernetesClusterCategory", () => {
  let kubernetesClusterCategory: KubernetesClusterCategory;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    kubernetesClusterCategory = di.inject(kubernetesClusterCategoryInjectable);
  });

  describe("filteredItems", () => {
    const item1 = {
      icon: "Icon",
      title: "Title",
      onClick: () => {},
    };
    const item2 = {
      icon: "Icon 2",
      title: "Title 2",
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
