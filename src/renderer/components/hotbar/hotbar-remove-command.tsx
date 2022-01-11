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

import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import { ConfirmDialog } from "../confirm-dialog";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import type { Hotbar } from "../../../common/hotbar-types";

interface Dependencies {
  closeCommandOverlay: () => void;
  hotbarManager: {
    hotbars: Hotbar[];
    getById: (id: string) => Hotbar | undefined;
    remove: (hotbar: Hotbar) => void;
    getDisplayLabel: (hotbar: Hotbar) => string;
  };
}

const NonInjectedHotbarRemoveCommand = observer(({ closeCommandOverlay, hotbarManager }: Dependencies) => {
  const options = hotbarManager.hotbars.map(hotbar => ({
    value: hotbar.id,
    label: hotbarManager.getDisplayLabel(hotbar),
  }));

  const onChange = (id: string): void => {
    const hotbar = hotbarManager.getById(id);

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
      ok: () => hotbarManager.remove(hotbar),
      message: (
        <div className="confirm flex column gaps">
          <p>
            Are you sure you want remove hotbar <b>{hotbar.name}</b>?
          </p>
        </div>
      ),
    });
  };

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onChange(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Remove hotbar"
    />
  );
});

export const HotbarRemoveCommand = withInjectables<Dependencies>(NonInjectedHotbarRemoveCommand, {
  getProps: (di, props) => ({
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    hotbarManager: di.inject(hotbarManagerInjectable),
    ...props,
  }),
});
