/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarStoreInjectable from "../../../common/hotbar-store.injectable";
import { ConfirmDialog } from "../confirm-dialog";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { Hotbar } from "../../../common/hotbar-types";

interface Dependencies {
  closeCommandOverlay: () => void;
  hotbarStore: {
    hotbars: Hotbar[];
    remove: (hotbar: Hotbar) => void;
    getDisplayLabel: (hotbar: Hotbar) => string;
  };
}

const NonInjectedHotbarRemoveCommand = observer(({
  closeCommandOverlay,
  hotbarStore,
}: Dependencies) => (
  <Select
    menuPortalTarget={null}
    onChange={hotbar => {
      if (!hotbar) {
        return;
      }

      closeCommandOverlay();
      // TODO: make confirm dialog injectable
      ConfirmDialog.open({
        okButtonProps: {
          label: "Remove Hotbar",
          primary: false,
          accent: true,
        },
        ok: () => hotbarStore.remove(hotbar),
        message: (
          <div className="confirm flex column gaps">
            <p>
              Are you sure you want remove hotbar
              {" "}
              <b>
                {hotbar.name}
              </b>
              ?
            </p>
          </div>
        ),
      });
    } }
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={hotbarStore.hotbars}
    getOptionLabel={hotbar => hotbarStore.getDisplayLabel(hotbar)}
    autoFocus={true}
    escapeClearsValue={false}
    placeholder="Remove hotbar"
  />
));

export const HotbarRemoveCommand = withInjectables<Dependencies>(NonInjectedHotbarRemoveCommand, {
  getProps: (di, props) => ({
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    hotbarStore: di.inject(hotbarStoreInjectable),
    ...props,
  }),
});
