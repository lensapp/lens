/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { AdditionalCategoryColumnRegistration } from "../custom-category-columns";
import { customCatalogCategoryColumnInjectionToken } from "./custom-token";

const customCategoryColumnsRegistratorInjectable = getInjectable({
  id: "custom-category-columns-registrator",
  instantiate: () => (ext) => {
    const extension = ext as LensRendererExtension;

    return extension.additionalCategoryColumns.map(getInjectableForColumnRegistrationFor(extension));
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default customCategoryColumnsRegistratorInjectable;

const getInjectableForColumnRegistrationFor = (extension: LensRendererExtension) => ({
  group,
  id,
  kind,
  renderCell,
  titleProps,
  priority = 50,
  searchFilter,
  sortCallback,
}: AdditionalCategoryColumnRegistration) => {
  return getInjectable({
    id: `${extension.manifest.name}:${group}/${kind}:${id}`,
    instantiate: () => ({
      group,
      kind,
      registration: {
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
      },
    }),
    injectionToken: customCatalogCategoryColumnInjectionToken,
  });
};
