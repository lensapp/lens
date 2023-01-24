/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntityContextMenu } from "../api/catalog-entity";
import withConfirmationInjectable from "../components/confirm-dialog/with-confirm.injectable";

export interface NormalizedCatalogEntityContextMenu {
  title: string;
  icon?: string;
  onClick: () => void;
}

export type NormalizeCatalogEntityContextMenu = (menuItem: CatalogEntityContextMenu) => NormalizedCatalogEntityContextMenu;

const normalizeCatalogEntityContextMenuInjectable = getInjectable({
  id: "normalize-catalog-entity-context-menu",
  instantiate: (di): NormalizeCatalogEntityContextMenu => {
    const withConfirmation = di.inject(withConfirmationInjectable);

    return (menuItem) => {
      if (menuItem.confirm) {
        return {
          title: menuItem.title,
          icon: menuItem.icon,
          onClick: withConfirmation({
            message: menuItem.confirm.message,
            ok: menuItem.onClick,
            okButtonProps: {
              primary: false,
              accent: true,
            },
          }),
        };
      }

      return menuItem;
    };
  },
});

export default normalizeCatalogEntityContextMenuInjectable;
