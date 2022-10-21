/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sortBy } from "lodash/fp";
import type { Composite } from "./get-composite";
import getComposite from "./get-composite";
import { getCompositePaths } from "../get-composite-paths/get-composite-paths";

describe("get-composite", () => {
  it("given items and a specified root id, creates a composite", () => {
    const someRootItem = {
      someId: "some-root-id",
      someParentId: undefined,
      someProperty: "some-root-content",
    };

    const someItem = {
      someId: "some-id",
      someParentId: "some-root-id",
      someProperty: "some-content",
    };

    const someNestedItem = {
      someId: "some-nested-id",
      someParentId: "some-id",
      someProperty: "some-nested-content",
    };

    const items = [someRootItem, someItem, someNestedItem];

    const composite = getComposite({
      source: items,
      rootId: "some-root-id",
      getId: (x) => x.someId,
      getParentId: (x) => x.someParentId,
    });

    expect(composite).toEqual({
      id: "some-root-id",
      value: someRootItem,

      children: [
        {
          id: "some-id",
          parentId: "some-root-id",
          value: someItem,

          children: [
            {
              id: "some-nested-id",
              parentId: "some-id",
              value: someNestedItem,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("given items and an unspecified root id and single item without parent as root, creates a composite", () => {
    const someRootItem = {
      someId: "some-root-id",
      someProperty: "some-root-content",
      // Notice: no "someParentId" makes this the root.
      someParentId: undefined,
    };

    const someItem = {
      someId: "some-id",
      someParentId: "some-root-id",
      someProperty: "some-content",
    };

    const someNestedItem = {
      someId: "some-nested-id",
      someParentId: "some-id",
      someProperty: "some-nested-content",
    };

    const items = [someRootItem, someItem, someNestedItem];

    const composite = getComposite({
      source: items,
      // Notice: no root id
      // rootId: "some-root-id",
      getId: (x) => x.someId,
      getParentId: (x) => x.someParentId,
    });

    expect(composite).toEqual({
      id: "some-root-id",
      value: someRootItem,

      children: [
        {
          id: "some-id",
          parentId: "some-root-id",
          value: someItem,

          children: [
            {
              id: "some-nested-id",
              parentId: "some-id",
              value: someNestedItem,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("given items and an unspecified root id and multiple items without parent as root, throws", () => {
    const someRootItem = {
      someId: "some-root-id",
      // Notice: no "someParentId" makes this a root.
      someParentId: undefined,
    };

    const someOtherRootItem = {
      someId: "some-other-root-id",
      // Notice: no "someParentId" makes also this a root.
      someParentId: undefined,
    };

    const items = [someRootItem, someOtherRootItem];

    expect(() => {
      getComposite({
        source: items,
        // Notice: no root id
        // rootId: "some-root-id",
        getId: (x) => x.someId,
        getParentId: (x) => x.someParentId,
      });
    }).toThrow(
      'Tried to get a composite, but multiple roots where encountered: "some-root-id", "some-other-root-id"',
    );
  });

  it("given non-unique ids, throws", () => {
    const someItem = {
      someId: "some-id",
      someParentId: "irrelevant",
    };

    const someOtherItem = {
      someId: "some-id",
      someParentId: "irrelevant",
    };

    const items = [someItem, someOtherItem];

    expect(() => {
      getComposite({
        source: items,
        rootId: "irrelevant",
        getId: (x) => x.someId,
        getParentId: (x) => x.someParentId,
      });
    }).toThrow(
      'Tried to get a composite but encountered non-unique ids: "some-id"',
    );
  });

  it("given items with missing parent ids, when creating composite without handling for unknown parents, throws", () => {
    const someItem = {
      someId: "some-id",
      someParentId: undefined,
    };

    const someItemWithMissingParentId = {
      someId: "some-other-id",
      someParentId: "some-missing-id",
    };

    const items = [someItem, someItemWithMissingParentId];

    expect(() => {
      getComposite({
        source: items,
        rootId: "irrelevant",
        getId: (x) => x.someId,
        getParentId: (x) => x.someParentId,
      });
    }).toThrow(
      `Tried to get a composite but encountered missing parent ids: "some-missing-id".

Available parent ids are:
"some-id",
"some-other-id"`,
    );
  });

  describe("given items with missing parent ids, when creating composite with handling for missing parents", () => {
    let composite: Composite<any>;
    let handleMissingParentIdMock: jest.Mock;

    beforeEach(() => {
      const someItem = {
        id: "some-root-id",
        parentId: undefined,
      };

      const someItemWithMissingParentId = {
        id: "some-orphan-id",
        // Note: missing parent id makes the item orphan.
        parentId: "some-missing-id",
      };

      const items = [someItem, someItemWithMissingParentId];

      handleMissingParentIdMock = jest.fn();

      composite = getComposite({
        source: items,
        handleMissingParentIds: handleMissingParentIdMock,
      });
    });

    it("creates composite without the orphan item, and without throwing", () => {
      const paths = getCompositePaths(composite);

      expect(paths).toEqual(["some-root-id"]);
    });

    it("handles the missing parent ids", () => {
      expect(handleMissingParentIdMock).toHaveBeenCalledWith({
        missingParentIds: ["some-missing-id"],
        availableParentIds: ["some-root-id", "some-orphan-id"],
      });
    });
  });

  it("given items with same id and parent id, throws", () => {
    const someItem = {
      id: "some-id",
      parentId: "some-id",
    };

    const someRoot = {
      id: "root",
      someParentId: undefined,
    };

    const items = [someItem, someRoot];

    expect(() => {
      getComposite({
        source: items,
      });
    }).toThrow('Tried to get a composite, but found items with self as parent: "some-id"');
  });

  it("given undefined ids, throws", () => {
    const root = {
      someParentId: undefined,
      someId: "some-root",
    };

    const someItem = {
      someParentId: "some-root",
      someId: undefined,
    };

    const someOtherItem = {
      someParentId: "some-root",
      someId: undefined,
    };

    const items = [root, someItem, someOtherItem];

    expect(() => {
      getComposite({
        source: items,
        rootId: "some-root",
        getId: (x) => x.someId as any,
        getParentId: (x) => x.someParentId,
      });
    }).toThrow("Tried to get a composite but encountered 2 undefined ids");
  });

  it("given items with default properties for id and parentId, creates a composite", () => {
    const someRootItem = {
      id: "some-root-id",
    };

    const someItem = {
      id: "some-id",
      parentId: "some-root-id",
    };

    const someNestedItem = {
      id: "some-nested-id",
      parentId: "some-id",
    };

    const items = [someRootItem, someItem, someNestedItem];

    const composite = getComposite({
      source: items,
      // Notice: no need for functions
      // getId: (x) => x.id,
      // getParentId: (x) => x.parentId,
    });

    expect(composite).toEqual({
      id: "some-root-id",
      value: someRootItem,

      children: [
        {
          id: "some-id",
          parentId: "some-root-id",
          value: someItem,

          children: [
            {
              id: "some-nested-id",
              parentId: "some-id",
              value: someNestedItem,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("given explicitly ordered items, creates a composite with ordered children", () => {
    const someRootItem = {
      id: "some-root-id",
      someOrderNumber: 1,
    };

    const someItem1 = {
      id: "some-id-1",
      parentId: "some-root-id",
      someOrderNumber: 1,
    };

    const someItem2 = {
      id: "some-id-2",
      parentId: "some-root-id",
      someOrderNumber: 2,
    };

    const someChildItem1 = {
      id: "some-child-id-1",
      parentId: "some-id-1",
      someOrderNumber: 1,
    };

    const someChildItem2 = {
      id: "some-child-id-2",
      parentId: "some-id-1",
      someOrderNumber: 2,
    };

    const items = [
      someRootItem,
      // Note: not in order yet.
      someItem2,
      someItem1,
      someChildItem2,
      someChildItem1,
    ];

    const composite = getComposite({
      source: items,
      // Note: this is the explicit function to order a composite's children.
      getOrderedChildren: (things) =>
        sortBy((thing) => thing.someOrderNumber, things),
    });

    const orderedPaths = getCompositePaths(composite);

    expect(orderedPaths).toEqual([
      "some-root-id",
      "some-root-id -> some-id-1",
      "some-root-id -> some-id-1 -> some-child-id-1",
      "some-root-id -> some-id-1 -> some-child-id-2",
      "some-root-id -> some-id-2",
    ]);
  });

  it("given implicitly ordered items, creates a composite with ordered children", () => {
    const someRootItem = {
      id: "some-root-id",
      orderNumber: 1,
    };

    const someItem1 = {
      id: "some-id-1",
      parentId: "some-root-id",
      orderNumber: 1,
    };

    const someItem2 = {
      id: "some-id-2",
      parentId: "some-root-id",
      orderNumber: 2,
    };

    const someChildItem1 = {
      id: "some-child-id-1",
      parentId: "some-id-1",
      orderNumber: 1,
    };

    const someChildItem2 = {
      id: "some-child-id-2",
      parentId: "some-id-1",
      orderNumber: 2,
    };

    const items = [
      someRootItem,
      // Note: not in order yet.
      someItem2,
      someItem1,
      someChildItem2,
      someChildItem1,
    ];

    const composite = getComposite({
      source: items,
      // Note: without explicit getOrderedChildren for ordering, implicit default value of "orderNumber" will be used, if it exists.
      // getOrderedChildren: things => sortBy(thing => thing.orderNumber, things),
    });

    const orderedPaths = getCompositePaths(composite);

    expect(orderedPaths).toEqual([
      "some-root-id",
      "some-root-id -> some-id-1",
      "some-root-id -> some-id-1 -> some-child-id-1",
      "some-root-id -> some-id-1 -> some-child-id-2",
      "some-root-id -> some-id-2",
    ]);
  });
});
