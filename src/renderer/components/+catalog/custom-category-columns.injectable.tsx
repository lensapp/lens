/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { getOrInsert, getOrInsertMap } from "../../utils";
import type { RegisteredAdditionalCategoryColumn } from "./custom-category-columns";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

function getAdditionCategoryColumns({ extensions }: Dependencies): IComputedValue<Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>> {
  return computed(() => {
    const res = new Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>();

    for (const ext of extensions.get()) {
      for (const { renderCell, titleProps, priority = 50, searchFilter, sortCallback, ...registration } of ext.additionalCategoryColumns) {
        const byGroup = getOrInsertMap(res, registration.group);
        const byKind = getOrInsert(byGroup, registration.kind, []);
        const id = `${ext.name}:${registration.id}`;

        byKind.push({
          renderCell,
          priority,
          id,
          titleProps: {
            id,
            ...titleProps,
            sortBy: sortCallback
              ? id
              : undefined,
          },
          searchFilter,
          sortCallback,
        });
      }
    }

    return res;
  });
}

const categoryColumnsInjectable = getInjectable({
  instantiate: (di) => getAdditionCategoryColumns({
    extensions: di.inject(rendererExtensionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default categoryColumnsInjectable;
