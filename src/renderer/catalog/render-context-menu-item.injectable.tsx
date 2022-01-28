/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { ConfirmDialogParams } from "../components/confirm-dialog";
import openConfirmDialogInjectable from "../components/confirm-dialog/dialog-open.injectable";
import { bind } from "../../common/utils";
import type { CatalogEntityContextMenu } from "../../common/catalog/catalog-entity";
import { MenuItem } from "../components/menu";
import { Icon } from "../components/icon";

interface Dependencies {
  openConfirmDialog: (params: ConfirmDialogParams) => void;
}

function registerEntityContextMenuItem({ openConfirmDialog }: Dependencies, display: "icon" | "title"): ({ title, icon, onClick: rawOnClick, confirm }: CatalogEntityContextMenu, index: number) => React.ReactNode {
  return ({ title, icon, onClick: rawOnClick, confirm }: CatalogEntityContextMenu, index: number) => {
    if (display === "icon" && !icon) {
      return null;
    }

    const onClick = confirm
      ? () => openConfirmDialog({
        okButtonProps: {
          primary: false,
          accent: true,
        },
        ok: rawOnClick,
        message: confirm.message,
      })
      : () => {
        (async () => await rawOnClick())()
          .catch(error => console.error(error));
      };

    return (
      <MenuItem key={index} onClick={onClick}>
        {
          display === "title"
            ? title
            : (
              <Icon
                interactive
                tooltip={title}
                {...{ [icon.includes("<svg") ? "svg" : "material"]: icon }}
              />
            )
        }
      </MenuItem>
    );
  };
}

export type RenderEntityContextMenuItem = (display: "title" | "icon") => (menuItem: CatalogEntityContextMenu, index: number) => React.ReactNode;

const renderEntityContextMenuItemInjectable = getInjectable({
  instantiate: (di) => bind(registerEntityContextMenuItem, null, {
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }) as RenderEntityContextMenuItem,
  lifecycle: lifecycleEnum.singleton,
});

export default renderEntityContextMenuItemInjectable;
