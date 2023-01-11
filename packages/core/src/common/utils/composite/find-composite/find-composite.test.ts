/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Composite } from "../get-composite/get-composite";
import { findComposite } from "./find-composite";
import { getCompositeFor } from "../get-composite/get-composite";

describe("find-composite", () => {
  let composite: Composite<{ id: string; parentId?: string }>;

  beforeEach(() => {
    const getComposite = getCompositeFor<{
      id: string;
      parentId?: string;
    }>({
      rootId: "some-root-id",
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    composite = getComposite([
      { id: "some-root-id" },
      { id: "some-child-id", parentId: "some-root-id" },
      { id: "some-grandchild-id", parentId: "some-child-id" },
      { id: "some-other-grandchild-id", parentId: "some-child-id" },
    ]);
  });

  it("when finding root using path, does so", () => {
    const actual = findComposite("some-root-id")(composite);

    expect(actual.id).toBe("some-root-id");
  });

  it("when finding child using path, does so", () => {
    const actual = findComposite("some-root-id", "some-child-id")(composite);

    expect(actual.id).toBe("some-child-id");
  });

  it("when finding grandchild using path, does so", () => {
    const actual = findComposite(
      "some-root-id",
      "some-child-id",
      "some-grandchild-id",
    )(composite);

    expect(actual.id).toBe("some-grandchild-id");
  });

  it("when finding with non existing leaf-level path, throws", () => {
    expect(() => {
      findComposite(
        "some-root-id",
        "some-child-id",
        "some-non-existing-grandchild-id",
      )(composite);
    }).toThrow(`Tried to find 'some-root-id -> some-child-id -> some-non-existing-grandchild-id' from a composite, but found nothing.

Node 'some-root-id -> some-child-id' had only following children:
some-grandchild-id
some-other-grandchild-id`);
  });

  it("when finding with non-existing mid-level path, throws", () => {
    expect(() => {
      findComposite(
        "some-root-id",
        "some-non-existing-child-id",
        "some-non-existing-grandchild-id",
      )(composite);
    }).toThrow(`Tried to find 'some-root-id -> some-non-existing-child-id -> some-non-existing-grandchild-id' from a composite, but found nothing.

Node 'some-root-id' had only following children:
some-child-id`);
  });

  it("when finding with non-existing root-level path, throws", () => {
    expect(() => {
      findComposite(
        "some-non-existing-root-id",
        "some-non-existing-child-id",
        "some-non-existing-grandchild-id",
      )(composite);
    }).toThrow(`Tried to find 'some-non-existing-root-id -> some-non-existing-child-id -> some-non-existing-grandchild-id' from a composite, but found nothing.

Node 'some-root-id' had only following children:
some-child-id`);
  });
});
