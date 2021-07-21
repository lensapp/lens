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
import { action, computed, makeObservable, observable } from "mobx";
import { HotbarStore } from "../../../common/hotbar-store";
import { hotbarDisplayLabel } from "./hotbar-display-label";
import { Input } from "../input";
import { uniqueHotbarName } from "./hotbar-add-command";
import { CommandOverlay } from "../command-palette";

@observer
export class HotbarRenameCommand extends React.Component {
  @observable hotbarId = "";
  @observable hotbarName = "";

  constructor(props: {}) {
    super(props);
    makeObservable(this);
  }

  @computed get options() {
    return HotbarStore.getInstance().hotbars.map((hotbar) => {
      return { value: hotbar.id, label: hotbarDisplayLabel(hotbar.id) };
    });
  }

  @action onSelect = (id: string) => {
    this.hotbarId = id;
    this.hotbarName = HotbarStore.getInstance().getById(this.hotbarId).name;
  };

  onSubmit = (name: string) => {
    if (!name.trim()) {
      return;
    }

    const hotbarStore = HotbarStore.getInstance();
    const hotbar = HotbarStore.getInstance().getById(this.hotbarId);

    if (!hotbar) {
      return;
    }

    hotbarStore.setHotbarName(this.hotbarId, name);
    CommandOverlay.close();
  };

  renderHotbarList() {
    return (
      <>
        <Select
          menuPortalTarget={null}
          onChange={(v) => this.onSelect(v.value)}
          components={{ DropdownIndicator: null, IndicatorSeparator: null }}
          menuIsOpen={true}
          options={this.options}
          autoFocus={true}
          escapeClearsValue={false}
          placeholder="Rename hotbar"/>
      </>
    );
  }

  renderNameInput() {
    return (
      <>
        <Input
          trim={true}
          value={this.hotbarName}
          onChange={v => this.hotbarName = v}
          placeholder="New hotbar name"
          autoFocus={true}
          theme="round-black"
          validators={uniqueHotbarName}
          onSubmit={this.onSubmit}
          showValidationLine={true}
        />
        <small className="hint">
          Please provide a new hotbar name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }

  render() {

    return (
      <>
        {!this.hotbarId ? this.renderHotbarList() : this.renderNameInput()}
      </>
    );
  }
}
