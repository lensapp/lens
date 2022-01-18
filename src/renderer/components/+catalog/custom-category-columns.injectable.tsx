/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { getOrInsert } from "../../utils";
import type { RegisteredAdditionalCategoryColumn } from "./custom-category-columns";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

function getAdditionCategoryColumns({ extensions }: Dependencies): IComputedValue<Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>> {
  return computed(() => {
    const res = new Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>();

    for (const ext of extensions.get()) {
      for (const { renderCell, titleProps, priority = 50, searchFilter, sortCallback, ...registration } of ext.additionalCategoryColumns) {
        const byGroup = getOrInsert(res, registration.group, new Map<string, RegisteredAdditionalCategoryColumn[]>());
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
