/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Composite } from "../get-composite";
import getComposite from "../get-composite";
import { findComposite } from "./find-composite";

describe("find-composite", () => {
  let composite: Composite<{ id: string; parentId?: string; someProperty: string }>;

  beforeEach(() => {
    composite = getComposite({
      source: [
        { id: "some-root-id", someProperty: "some-value" },
        { id: "some-child-id", parentId: "some-root-id", someProperty: "some-value" },
        { id: "some-irrelevant-grandchild-id", parentId: "some-child-id", someProperty: "some-value" },
        { id: "some-grandchild-id", parentId: "some-child-id", someProperty: "some-value" },
      ],

      rootId: "some-root-id",
    });
  });

  it("when finding root using path, does so", () => {
    const actual = findComposite("some-root-id")(composite);

    expect(actual?.id).toBe("some-root-id");
  });

  it("when finding child using path, does so", () => {
    const actual = findComposite("some-root-id.some-child-id")(composite);

    expect(actual?.id).toBe("some-child-id");
  });

  it("when finding grandchild using path, does so", () => {
    const actual = findComposite(
      "some-root-id.some-child-id.some-grandchild-id",
    )(composite);

    expect(actual?.id).toBe("some-grandchild-id");
  });

  it("when finding with non existing path, returns undefined", () => {
    const actual = findComposite("some-root-id.some-non-existing-path")(
      composite,
    );

    expect(actual).toBe(undefined);
  });
});
