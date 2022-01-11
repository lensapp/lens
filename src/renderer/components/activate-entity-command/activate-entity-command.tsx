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

import { withInjectables } from "@ogre-tools/injectable-react";
import { computed, IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { broadcastMessage, catalogEntityRunListener } from "../../../common/ipc";
import type { CatalogEntity } from "../../api/catalog-entity";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { Select } from "../select";

interface Dependencies {
  closeCommandOverlay: () => void;
  entities: IComputedValue<CatalogEntity[]>;
}

const NonInjectedActivateEntityCommand = observer(({ closeCommandOverlay, entities }: Dependencies) => {
  const options = entities.get().map(entity => ({
    label: `${entity.kind}: ${entity.getName()}`,
    value: entity,
  }));

  const onSelect = (entity: CatalogEntity): void => {
    broadcastMessage(catalogEntityRunListener, entity.getId());
    closeCommandOverlay();
  };

  return (
    <Select
      menuPortalTarget={null}
      onChange={(v) => onSelect(v.value)}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={options}
      autoFocus={true}
      escapeClearsValue={false}
      placeholder="Activate entity ..."
    />
  );
});

export const ActivateEntityCommand = withInjectables<Dependencies>(NonInjectedActivateEntityCommand, {
  getProps: di => ({
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    entities: computed(() => [...catalogEntityRegistry.items]),
  }),
});
