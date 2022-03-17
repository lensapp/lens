/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
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
  const onSelect = (entity: CatalogEntity | null): void => {
    if (entity) {
      broadcastMessage(catalogEntityRunListener, entity.getId());
      closeCommandOverlay();
    }
  };

  return (
    <Select
      id="activate-entity-input"
      menuPortalTarget={null}
      onChange={onSelect}
      components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      menuIsOpen={true}
      options={entities.get()}
      getOptionLabel={entity => `${entity.kind}: ${entity.getName()}`}
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
