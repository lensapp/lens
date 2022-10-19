/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getCompositeNormalization } from "./get-composite-normalization";
import getComposite from "../get-composite/get-composite";

describe("get-composite-normalization", () => {
  it("given a composite, flattens it to path and composite", () => {
    const someRootItem = {
      id: "some-root-id",
      parentId: undefined,
    };

    const someItem = {
      id: "some-id",
      parentId: "some-root-id",
    };

    const someNestedItem = {
      id: "some-child-id",
      parentId: "some-id",
    };

    const items = [someRootItem, someItem, someNestedItem];

    const composite = getComposite({
      source: items,
    });

    const actual = getCompositeNormalization(composite);

    expect(actual).toEqual([
      ["some-root-id", expect.objectContaining({ value: someRootItem })],

      ["some-root-id.some-id", expect.objectContaining({ value: someItem })],

      [
        "some-root-id.some-id.some-child-id",
        expect.objectContaining({ value: someNestedItem }),
      ],
    ]);
  });
});
