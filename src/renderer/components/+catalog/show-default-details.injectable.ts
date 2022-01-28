/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { CatalogEntity } from "../../../common/catalog";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { bind } from "../../utils";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

function showDefaultDetails({ extensions }: Dependencies, entity: CatalogEntity): boolean {
  const registrations = extensions.get().flatMap(ext => ext.catalogEntityDetailItems);

  for (const registration of registrations) {
    if (
      typeof registration.priority === "number"
      && registration.priority > 999
      && registration.kind === entity.kind
      && registration.apiVersions.includes(entity.apiVersion)
    ) {
      return false;
    }
  }

  return true;
}

const showDefaultDetailsInjectable = getInjectable({
  instantiate: (di) => bind(showDefaultDetails, null, {
    extensions: di.inject(rendererExtensionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default showDefaultDetailsInjectable;
