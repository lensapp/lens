/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { Input, InputValidator } from "../input";
import type { CreateHotbarData, CreateHotbarOptions } from "../../../common/hotbar-store/hotbar-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import uniqueHotbarNameInjectable from "../input/validators/unique-hotbar-name.injectable";
import createNewHotbarInjectable from "../../../common/hotbar-store/create-new-hotbar.injectable";
import closeCommandDialogInjectable from "../command-palette/close-command-dialog.injectable";

interface Dependencies {
  closeCommandOverlay: () => void;
  addHotbar: (data: CreateHotbarData, { setActive }?: CreateHotbarOptions) => void;
  uniqueHotbarName: InputValidator;
}

const NonInjectedHotbarAddCommand = observer(({ closeCommandOverlay, addHotbar, uniqueHotbarName }: Dependencies) => {
  const onSubmit = (name: string) => {
    if (!name.trim()) {
      return;
    }

    addHotbar({ name }, { setActive: true });
    closeCommandOverlay();
  };

  return (
    <>
      <Input
        placeholder="Hotbar name"
        autoFocus={true}
        theme="round-black"
        data-test-id="command-palette-hotbar-add-name"
        validators={uniqueHotbarName}
        onSubmit={onSubmit}
        dirty={true}
        showValidationLine={true}
      />
      <small className="hint">
        Please provide a new hotbar name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
      </small>
    </>
  );
});

export const HotbarAddCommand = withInjectables<Dependencies>(NonInjectedHotbarAddCommand, {
  getProps: (di, props) => ({
    closeCommandOverlay: di.inject(closeCommandDialogInjectable),
    addHotbar: di.inject(createNewHotbarInjectable),
    uniqueHotbarName: di.inject(uniqueHotbarNameInjectable),
    ...props,
  }),
});
