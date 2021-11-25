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


import { Select } from "../select";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React, { useState } from "react";
import { CommandOverlay } from "./command-overlay";
import type { CatalogEntity } from "../../../common/catalog";
import { navigate } from "../../navigation";
import { broadcastMessage } from "../../../common/ipc";
import { IpcRendererNavigationEvents } from "../../navigation/events";
import type { RegisteredCommand } from "./registered-commands/commands";
import { iter } from "../../utils";
import { orderBy } from "lodash";
import { withInjectables } from "@ogre-tools/injectable-react";
import registeredCommandsInjectable from "./registered-commands/registered-commands.injectable";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";

interface Dependencies {
  commands: IComputedValue<Map<string, RegisteredCommand>>;
  activeEntity?: CatalogEntity;
}

const NonInjectedCommandDialog = observer(({ commands, activeEntity }: Dependencies) => {
  const [searchValue, setSearchValue] = useState("");

  const executeAction = (commandId: string) => {
    const command = commands.get().get(commandId);

    if (!command) {
      return;
    }

    try {
      CommandOverlay.close();
      command.action({
        entity: activeEntity,
        navigate: (url, opts = {}) => {
          const { forceRootFrame = false } = opts;

          if (forceRootFrame) {
            broadcastMessage(IpcRendererNavigationEvents.NAVIGATE_IN_APP, url);
          } else {
            navigate(url);
          }
        },
      });
    } catch (error) {
      console.error("[COMMAND-DIALOG] failed to execute command", command.id, error);
    }
  };

  const context = {
    entity: activeEntity,
  };
  const activeCommands = iter.filter(commands.get().values(), command => {
    try {
      return command.isActive(context);
    } catch (error) {
      console.error(`[COMMAND-DIALOG]: isActive for ${command.id} threw an error, defaulting to false`, error);
    }

    return false;
  });
  const options = Array.from(activeCommands, ({ id, title }) => ({
    value: id,
    label: typeof title === "function"
      ? title(context)
      : title,
  }));

  // Make sure the options are in the correct order
  orderBy(options, "label", "asc");

  return (
    <Select
      menuPortalTarget={null}
      onChange={v => executeAction(v.value)}
      components={{
        DropdownIndicator: null,
        IndicatorSeparator: null,
      }}
      menuIsOpen
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      data-test-id="command-palette-search"
      placeholder="Type a command or search&hellip;"
      onInputChange={(newValue, { action }) => {
        if (action === "input-change") {
          setSearchValue(newValue);
        }
      }}
      inputValue={searchValue}
    />
  );
});

export const CommandDialog = withInjectables<Dependencies>(NonInjectedCommandDialog, {
  getProps: di => ({
    commands: di.inject(registeredCommandsInjectable),
    // TODO: replace with injection
    activeEntity: catalogEntityRegistry.activeEntity,
  }),
});
