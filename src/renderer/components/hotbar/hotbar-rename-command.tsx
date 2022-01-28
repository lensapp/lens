/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import hotbarStoreInjectable from "../../../common/hotbar-store/store.injectable";
import { Input, InputValidator } from "../input";
import type { Hotbar } from "../../../common/hotbar-store/hotbar";
import { withInjectables } from "@ogre-tools/injectable-react";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import uniqueHotbarNameInjectable from "../input/validators/unique-hotbar-name.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  hotbarManager: {
    hotbars: Hotbar[];
    getById: (id: string) => Hotbar | undefined;
    setHotbarName: (id: string, name: string) => void;
    getDisplayLabel: (hotbar: Hotbar) => string;
  };
  uniqueHotbarName: InputValidator;
}

const NonInjectedHotbarRenameCommand = observer(({ closeCommandOverlay, hotbarManager, uniqueHotbarName }: Dependencies) => {
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
    hotbarManager: di.inject(hotbarStoreInjectable),
    uniqueHotbarName: di.inject(uniqueHotbarNameInjectable),
    ...props,
  }),
});
