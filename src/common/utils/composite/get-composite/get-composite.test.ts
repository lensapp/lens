/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Composite } from "./get-composite";
import { getCompositePaths } from "../get-composite-paths/get-composite-paths";
import { sortBy } from "lodash/fp";
import { getCompositeFor } from "./get-composite";

interface SomeItem {
  id: string;
  parentId?: string;
  orderNumber?: number;
}

describe("get-composite", () => {
  it("given items and an explicit root id, creates a composite", () => {
    const someRootItem = {
      id: "some-root-id",
      someProperty: "some-root-content",
    };

    const someIrrelevantRootItem = {
      id: "some-irrelevant-root-id",
      someProperty: "some-other-root-content",
    };

    const someItem = {
      id: "some-id",
      parentId: "some-root-id",
      someProperty: "some-content",
    };

    const someNestedItem = {
      id: "some-nested-id",
      parentId: "some-id",
      someProperty: "some-nested-content",
    };

    const items = [someRootItem, someIrrelevantRootItem, someItem, someNestedItem];

    const getComposite = getCompositeFor<SomeItem>({
      rootId: "some-root-id",
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    const composite = getComposite(items);

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

  it("given items and implicit root, creates a composite", () => {
    const someRootItem = {
      id: "some-root-id",
      someProperty: "some-root-content",
      // Notice: no "parentId" makes this the implicit root.
      parentId: undefined,
    };

    const someItem = {
      id: "some-id",
      parentId: "some-root-id",
      someProperty: "some-content",
    };

    const someNestedItem = {
      id: "some-nested-id",
      parentId: "some-id",
      someProperty: "some-nested-content",
    };

    const items = [someRootItem, someItem, someNestedItem];

    const getComposite = getCompositeFor<SomeItem>({
      // Notice: no root id
      // rootId: "some-root-id",
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    const composite = getComposite(items);

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
      id: "some-root-id",
      // Notice: no "parentId" makes this a root.
      parentId: undefined,
    };

    const someOtherRootItem = {
      id: "some-other-root-id",
      // Notice: no "parentId" makes also this a root.
      parentId: undefined,
    };

    const items = [someRootItem, someOtherRootItem];

    const getComposite = getCompositeFor<SomeItem>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    expect(() => {
      getComposite(items);
    }).toThrow(
      'Tried to get a composite, but multiple roots where encountered: "some-root-id", "some-other-root-id"',
    );
  });

  it("given non-unique ids, throws", () => {
    const someItem = {
      id: "some-id",
      parentId: "irrelevant",
    };

    const someOtherItem = {
      id: "some-id",
      parentId: "irrelevant",
    };

    const items = [someItem, someOtherItem];

    const getComposite = getCompositeFor<SomeItem>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    expect(() => {
      getComposite(items);
    }).toThrow(
      'Tried to get a composite but encountered non-unique ids: "some-id"',
    );
  });

  it("given items with missing parent ids, when creating composite without handling for unknown parents, throws", () => {
    const someItem = {
      id: "some-id",
      parentId: undefined,
    };

    const someItemWithMissingParentId = {
      id: "some-other-id",
      parentId: "some-missing-id",
    };

    const items = [someItem, someItemWithMissingParentId];

    const getComposite = getCompositeFor<SomeItem>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    expect(() => {
      getComposite(items);
    }).toThrow(
      `Tried to get a composite but encountered missing parent ids: "some-missing-id".

Available parent ids are:
"some-id",
"some-other-id"`,
    );
  });

  describe("given items with missing parents, when creating composite with handling for missing parents", () => {
    let composite: Composite<any>;
    let handleMissingParentIdMock: jest.Mock;

    beforeEach(() => {
      const someItem = {
        id: "some-root-id",
      };

      const someItemWithMissingParentId = {
        id: "some-orphan-id",
        // Note: the item corresponding to this id does not exist,
        // making this item have a "missing parent".
        parentId: "some-missing-id",
      };

      const items = [someItem, someItemWithMissingParentId];

      handleMissingParentIdMock = jest.fn();

      const getComposite = getCompositeFor<SomeItem>({
        getId: (x) => x.id,
        getParentId: (x) => x.parentId,
        handleMissingParentIds: handleMissingParentIdMock,
      });

      composite = getComposite(items);
    });

    it("creates composite without the orphan item, and without throwing", () => {
      const paths = getCompositePaths(composite);

      expect(paths).toEqual([["some-root-id"]]);
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
      parentId: undefined,
    };

    const items = [someItem, someRoot];

    const getComposite = getCompositeFor<SomeItem>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    expect(() => {
      getComposite(items);
    }).toThrow(
      'Tried to get a composite, but found items with self as parent: "some-id"',
    );
  });

  it("given undefined ids, throws", () => {
    const root = {
      parentId: undefined,
      id: "some-root",
    };

    const someItem = {
      parentId: "some-root",
      id: undefined,
    };

    const someOtherItem = {
      parentId: "some-root",
      id: undefined,
    };

    const items = [root, someItem, someOtherItem];

    const getComposite = getCompositeFor<any>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
    });

    expect(() => {
      getComposite(items);
    }).toThrow("Tried to get a composite but encountered 2 undefined ids");
  });

  it("given transformed children, creates a composite with transformed children", () => {
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

    const getComposite = getCompositeFor<SomeItem>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
      transformChildren: (things) =>
        sortBy((thing) => thing.orderNumber, things),
    });

    const composite = getComposite(items);

    const orderedPaths = getCompositePaths(composite);

    expect(orderedPaths).toEqual([
      ["some-root-id"],
      ["some-root-id", "some-id-1"],
      ["some-root-id", "some-id-1", "some-child-id-1"],
      ["some-root-id", "some-id-1", "some-child-id-2"],
      ["some-root-id", "some-id-2"],
    ]);
  });
});
