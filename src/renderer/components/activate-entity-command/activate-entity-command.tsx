/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { CatalogEntity } from "../../../common/catalog";
import { broadcastMessage, catalogEntityRunListener } from "../../../common/ipc";
import entitiesInjectable from "../../catalog/entities.injectable";
import closeCommandDialogInjectable from "../command-palette/close-command-dialog.injectable";
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
    closeCommandOverlay: di.inject(closeCommandDialogInjectable),
    entities: di.inject(entitiesInjectable),
  }),
});
