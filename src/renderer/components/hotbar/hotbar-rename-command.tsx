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

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import { Input } from "../input";
import { uniqueHotbarName } from "./hotbar-add-command";
import type { Hotbar } from "../../../common/hotbar-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  hotbarManager: {
    hotbars: Hotbar[];
    getById: (id: string) => Hotbar | undefined;
    setHotbarName: (id: string, name: string) => void;
    getDisplayLabel: (hotbar: Hotbar) => string;
  };
}

const NonInjectedHotbarRenameCommand = observer(({ closeCommandOverlay, hotbarManager }: Dependencies) => {
  const [hotbarId, setHotbarId] = useState("");
  const [hotbarName, setHotbarName] = useState("");

  const options = hotbarManager.hotbars.map(hotbar => ({
    value: hotbar.id,
    label: hotbarManager.getDisplayLabel(hotbar),
  }));

  const onSelect = (id: string) => {
    setHotbarId(id);
    setHotbarName(hotbarManager.getById(id).name);
  };
  const onSubmit = (name: string) => {
    if (!name.trim()) {
      return;
    }

    hotbarManager.setHotbarName(hotbarId, name);
    closeCommandOverlay();
  };

  if (hotbarId) {
    return (
      <>
        <Input
          trim={true}
          value={hotbarName}
          onChange={setHotbarName}
          placeholder="New hotbar name"
          autoFocus={true}
          theme="round-black"
          validators={uniqueHotbarName}
          onSubmit={onSubmit}
          showValidationLine={true}
        />
        <small className="hint">
          Please provide a new hotbar name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onSelect(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Rename hotbar"
    />
  );
});

export const HotbarRenameCommand = withInjectables<Dependencies>(NonInjectedHotbarRenameCommand, {
  getProps: (di, props) => ({
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    hotbarManager: di.inject(hotbarManagerInjectable),
    ...props,
  }),
});
