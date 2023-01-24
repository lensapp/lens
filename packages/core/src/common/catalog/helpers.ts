/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "./catalog-entity";
import GraphemeSplitter from "grapheme-splitter";
import { hasOwnProperty, hasTypedProperty, isObject, isString, iter } from "@k8slens/utilities";

function getNameParts(name: string): string[] {
  const byWhitespace = name.split(/\s+/);

  if (byWhitespace.length > 1) {
    return byWhitespace;
  }

  const byDashes = name.split(/[-_]+/);

  if (byDashes.length > 1) {
    return byDashes;
  }

  return name.split(/@+/);
}

export function limitGraphemeLengthOf(src: string, count: number): string {
  const splitter = new GraphemeSplitter();

  return iter
    .chain(splitter.iterateGraphemes(src))
    .take(count)
    .join("");
}

export function computeDefaultShortName(name: string) {
  if (!name || typeof name !== "string") {
    return "??";
  }

  const [rawFirst, rawSecond, rawThird] = getNameParts(name);
  const splitter = new GraphemeSplitter();
  const first = splitter.iterateGraphemes(rawFirst);
  const second = rawSecond ? splitter.iterateGraphemes(rawSecond): first;
  const third = rawThird ? splitter.iterateGraphemes(rawThird) : iter.newEmpty<string>();

  return iter.chain(iter.take(first, 1))
    .concat(iter.take(second, 1))
    .concat(iter.take(third, 1))
    .join("");
}

export function getShortName(entity: CatalogEntity): string {
  return entity.metadata.shortName || computeDefaultShortName(entity.getName());
}

export function getIconColourHash(entity: CatalogEntity): string {
  return `${entity.metadata.name}-${entity.metadata.source}`;
}

export function getIconBackground(entity: CatalogEntity): string | undefined {
  if (isObject(entity.spec.icon)) {
    if (hasTypedProperty(entity.spec.icon, "background", isString)) {
      return entity.spec.icon.background;
    }

    return hasOwnProperty(entity.spec.icon, "src")
      ? "transparent"
      : undefined;
  }

  return undefined;
}

export function getIconMaterial(entity: CatalogEntity): string | undefined {
  if (
    isObject(entity.spec.icon)
    && hasTypedProperty(entity.spec.icon, "material", isString)
  ) {
    return entity.spec.icon.material;
  }

  return undefined;
}
