/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { pipeline } from "@ogre-tools/fp";
import {
  countBy,
  filter,
  toPairs,
  nth,
  map,
  uniq,
  without,
  compact,
  identity,
} from "lodash/fp";

export interface Composite<T> {
  id: string;
  parentId: string | undefined;
  value: T;
  children: Composite<T>[];
}

interface Configuration<T> {
  rootId?: string;
  getId: (thing: T) => string;
  getParentId: (thing: T) => string | undefined;
  transformChildren?: (things: T[]) => T[];
  handleMissingParentIds?: (parentIdsForHandling: ParentIdsForHandling) => void;
}

export const getCompositeFor = <T>({
  rootId = undefined,
  getId,
  getParentId,
  transformChildren = identity,
  handleMissingParentIds = throwMissingParentIds,
}: Configuration<T>) => (source: T[]) => {
    const undefinedIds = pipeline(
      source,
      filter((x) => getId(x) === undefined),
    );

    if (undefinedIds.length) {
      throw new Error(
        `Tried to get a composite but encountered ${undefinedIds.length} undefined ids`,
      );
    }

    const selfReferencingIds = pipeline(
      source,
      filter((x) => getId(x) === getParentId(x)),
      map(getId),
    );

    if (selfReferencingIds.length) {
      throw new Error(
        `Tried to get a composite, but found items with self as parent: "${selfReferencingIds.join(
          '", ',
        )}"`,
      );
    }

    const duplicateIds = pipeline(
      source,
      countBy(getId),
      toPairs,
      filter(([, count]) => count > 1),
      map(nth(0)),
    );

    if (duplicateIds.length) {
      throw new Error(
        `Tried to get a composite but encountered non-unique ids: "${duplicateIds
          .map((x) => String(x))
          .join('", "')}"`,
      );
    }

    const allIds = pipeline(source, map(getId));

    const allParentIds = pipeline(source, map(getParentId), uniq, compact);

    const missingParentIds = without(allIds, allParentIds);

    if (missingParentIds.length) {
      handleMissingParentIds({ missingParentIds, availableParentIds: allIds });
    }

    const toComposite = (thing: T): Composite<T> => {
      const thingId = getId(thing);

      return {
        id: thingId,
        parentId: getParentId(thing),
        value: thing,

        children: pipeline(
          source,

          filter((childThing) => {
            const parentId = getParentId(childThing);

            return parentId === thingId;
          }),

          transformChildren,

          map(toComposite),
        ),
      };
    };

    const isRootId = rootId
      ? (thing: T) => getId(thing) === rootId
      : (thing: T) => getParentId(thing) === undefined;

    const roots = source.filter(isRootId);

    if (roots.length > 1) {
      throw new Error(
        `Tried to get a composite, but multiple roots where encountered: "${roots
          .map(getId)
          .join('", "')}"`,
      );
    }

    return toComposite(roots[0]);
  };

interface ParentIdsForHandling {
  missingParentIds: string[];
  availableParentIds: string[];
}

const throwMissingParentIds = ({
  missingParentIds,
  availableParentIds,
}: ParentIdsForHandling) => {
  throw new Error(
    `Tried to get a composite but encountered missing parent ids: "${missingParentIds.join(
      '", "',
    )}".\n\nAvailable parent ids are:\n"${availableParentIds.join('",\n"')}"`,
  );
};
