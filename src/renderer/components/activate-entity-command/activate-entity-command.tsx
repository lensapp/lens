/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { computed, IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { broadcastMessage } from "../../../common/ipc";
import { catalogEntityRunListener } from "../../../common/ipc/catalog";
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
