/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import getComposite from "../get-composite/get-composite";
import { getCompositePaths } from "./get-composite-paths";

describe("get-composite-paths", () => {
  it("given composite with ordered children, returns ordered paths", () => {
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

    const composite = getComposite({
      source: items,
    });

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
