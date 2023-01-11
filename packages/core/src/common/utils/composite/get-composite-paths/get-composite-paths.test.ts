/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getCompositePaths } from "./get-composite-paths";
import { sortBy } from "lodash/fp";
import { getCompositeFor } from "../get-composite/get-composite";

describe("get-composite-paths", () => {
  it("given composite with transformed children, returns paths of transformed children in hierarchical order", () => {
    const someRootItem = {
      id: "some-root-id",
    };

    const someChildItem1 = {
      id: "some-child-id-1",
      parentId: "some-root-id",
      orderNumber: 1,
    };

    const someChildItem2 = {
      id: "some-child-id-2",
      parentId: "some-root-id",
      orderNumber: 2,
    };

    const someGrandchildItem1 = {
      id: "some-grandchild-id-1",
      parentId: "some-child-id-1",
      orderNumber: 1,
    };

    const someGrandchildItem2 = {
      id: "some-grandchild-id-2",
      parentId: "some-child-id-1",
      orderNumber: 2,
    };

    const items = [
      someRootItem,
      // Note: not in order yet.
      someChildItem2,
      someChildItem1,
      someGrandchildItem2,
      someGrandchildItem1,
    ];

    const getComposite = getCompositeFor<{
      id: string;
      parentId?: string;
      orderNumber?: number;
    }>({
      rootId: "some-root-id",
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
      transformChildren: children => sortBy(child => child.orderNumber, children),
    });

    const composite = getComposite(items);

    const actual = getCompositePaths(composite);

    expect(actual).toEqual([
      ["some-root-id"],
      ["some-root-id", "some-child-id-1"],
      ["some-root-id", "some-child-id-1", "some-grandchild-id-1"],
      ["some-root-id", "some-child-id-1", "some-grandchild-id-2"],
      ["some-root-id", "some-child-id-2"],
    ]);
  });
});
