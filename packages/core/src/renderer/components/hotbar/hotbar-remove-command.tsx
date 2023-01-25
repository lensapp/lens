/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarStoreInjectable from "../../../common/hotbars/store.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { HotbarStore } from "../../../common/hotbars/store";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  openConfirmDialog: OpenConfirmDialog;
  hotbarStore: HotbarStore;
}

const NonInjectedHotbarRemoveCommand = observer(({
  closeCommandOverlay,
  hotbarStore,
  openConfirmDialog,
}: Dependencies) => (
  <Select
    menuPortalTarget={null}
    onChange={option => {
      if (!option) {
        return;
      }

      closeCommandOverlay();
      openConfirmDialog({
        okButtonProps: {
          label: "Remove Hotbar",
          primary: false,
          accent: true,
        },
        ok: () => hotbarStore.remove(option.value),
        message: (
          <div className="confirm flex column gaps">
            <p>
              Are you sure you want remove hotbar
              {" "}
              <b>
                {option.value.name}
              </b>
              ?
            </p>
          </div>
        ),
      });
    } }
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={(
      hotbarStore.hotbars
        .map(hotbar => ({
          value: hotbar,
          label: hotbarStore.getDisplayLabel(hotbar),
        }))
    )}
    autoFocus={true}
    escapeClearsValue={false}
    placeholder="Remove hotbar"
  />
));

export const HotbarRemoveCommand = withInjectables<Dependencies>(NonInjectedHotbarRemoveCommand, {
  getProps: (di, props) => ({
    ...props,
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    hotbarStore: di.inject(hotbarStoreInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
