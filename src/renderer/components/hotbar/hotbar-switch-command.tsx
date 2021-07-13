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
import { CommandOverlay } from "../command-palette";
import { HotbarAddCommand } from "./hotbar-add-command";
import { HotbarRemoveCommand } from "./hotbar-remove-command";
import { hotbarDisplayLabel } from "./hotbar-display-label";

@observer
export class HotbarSwitchCommand extends React.Component {
  private static addActionId = "__add__";
  private static removeActionId = "__remove__";

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  @computed get options() {
    const hotbarStore = HotbarStore.getInstance();
    const options = hotbarStore.hotbars.map((hotbar) => {
      return { value: hotbar.id, label: hotbarDisplayLabel(hotbar.id) };
    });

    options.push({ value: HotbarSwitchCommand.addActionId, label: "Add hotbar ..." });

    if (hotbarStore.hotbars.length > 1) {
      options.push({ value: HotbarSwitchCommand.removeActionId, label: "Remove hotbar ..." });
    }

    return options;
  }

  onChange(idOrAction: string): void {
    switch(idOrAction) {
      case HotbarSwitchCommand.addActionId:
        CommandOverlay.open(<HotbarAddCommand />);

        return;
      case HotbarSwitchCommand.removeActionId:
        CommandOverlay.open(<HotbarRemoveCommand />);

        return;
      default:
        HotbarStore.getInstance().activeHotbarId = idOrAction;
        CommandOverlay.close();
    }
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
        placeholder="Switch to hotbar" />
    );
  }
}
