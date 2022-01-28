/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { CatalogEntity } from "../../common/catalog";
import type { LensMainExtension } from "../../extensions/lens-main-extension";
import mainExtensionsInjectable from "../../extensions/main-extensions.injectable";
import { iter } from "../../renderer/utils";

interface Dependencies {
  extensions: IComputedValue<LensMainExtension[]>;
}

const extensionSourcedEntitiesInjectable = getInjectable({
  instantiate: (di) => getExtensionSourcesComputed({
    extensions: di.inject(mainExtensionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default extensionSourcedEntitiesInjectable;

function getExtensionSourcesComputed({ extensions }: Dependencies): IComputedValue<CatalogEntity[]> {
  return computed(() => (
    Array.from(
      iter.flatMap(
        iter.flatMap(
          extensions.get(),
          ext => ext.sources.values(),
        ),
        source => source.get(),
      ),
    )
  ));
}

