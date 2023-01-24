/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { EmitCatalogEntityRun } from "../../../features/catalog/run/renderer/emit.injectable";
import emitCatalogEntityRunInjectable from "../../../features/catalog/run/renderer/emit.injectable";
import type { CatalogEntity } from "../../api/catalog-entity";
import catalogEnitiesInjectable from "../../api/catalog/entity/entities.injectable";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { Select } from "../select";

interface Dependencies {
  closeCommandOverlay: () => void;
  entities: IComputedValue<CatalogEntity[]>;
  emitCatalogEntityRun: EmitCatalogEntityRun;
}

const NonInjectedActivateEntityCommand = observer(({
  closeCommandOverlay,
  entities,
  emitCatalogEntityRun,
}: Dependencies) => (
  <Select
    id="activate-entity-input"
    menuPortalTarget={null}
    onChange={(option) => {
      if (option) {
        emitCatalogEntityRun(option.value.getId());
        closeCommandOverlay();
      }
    }}
    components={{ DropdownIndicator: null, IndicatorSeparator: null }}
    menuIsOpen={true}
    options={(
      entities.get()
        .map(entity => ({
          value: entity,
          label: `${entity.kind}: ${entity.getName()}`,
        }))
    )}
    autoFocus={true}
    escapeClearsValue={false}
    placeholder="Activate entity ..."
  />
));

export const ActivateEntityCommand = withInjectables<Dependencies>(NonInjectedActivateEntityCommand, {
  getProps: di => ({
    closeCommandOverlay: di.inject(commandOverlayInjectable).close,
    entities: di.inject(catalogEnitiesInjectable),
    emitCatalogEntityRun: di.inject(emitCatalogEntityRunInjectable),
  }),
});
