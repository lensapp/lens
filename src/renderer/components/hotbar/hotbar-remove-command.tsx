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
import { computed, makeObservable } from "mobx";
import { HotbarStore } from "../../../common/hotbar-store";
import { hotbarDisplayLabel } from "./hotbar-display-label";
import { CommandOverlay } from "../command-palette";
import { ConfirmDialog } from "../confirm-dialog";
import { Notifications } from "../notifications";

@observer
export class HotbarRemoveCommand extends React.Component {
  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  @computed get options() {
    return HotbarStore.getInstance().hotbars.map((hotbar) => {
      return { value: hotbar.id, label: hotbarDisplayLabel(hotbar.id) };
    });
  }

  onChange(id: string): void {
    const hotbarStore = HotbarStore.getInstance();
    const hotbar = hotbarStore.getById(id);

    CommandOverlay.close();

    if (!hotbar) {
      return;
    }

    if (hotbarStore.hotbars.length === 1) {
      Notifications.error("Can't remove the last hotbar");

      return;
    }

    ConfirmDialog.open({
      okButtonProps: {
        label: `Remove Hotbar`,
        primary: false,
        accent: true,
      },
      ok: () => {
        hotbarStore.remove(hotbar);
      },
      message: (
        <div className="confirm flex column gaps">
          <p>
            Are you sure you want remove hotbar <b>{hotbar.name}</b>?
          </p>
        </div>
      ),
    });
  }

  render() {
    return (
      <Select
        menuPortalTarget={null}
        onChange={(v) => this.onChange(v.value)}
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuIsOpen={true}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        placeholder="Remove hotbar" />
    );
  }
}
