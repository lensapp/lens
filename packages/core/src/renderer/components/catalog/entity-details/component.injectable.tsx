/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { CatalogEntity } from "../../../api/catalog-entity";
import type { CatalogEntityRegistry } from "../../../api/catalog/entity/registry";
import catalogEntityRegistryInjectable from "../../../api/catalog/entity/registry.injectable";
import { rootFrameChildComponentInjectionToken } from "@k8slens/react-application";
import type { HideEntityDetails } from "./hide.injectable";
import hideEntityDetailsInjectable from "./hide.injectable";
import selectedCatalogEntityInjectable from "./selected-entity.injectable";
import { CatalogEntityDetails } from "./view";

interface Dependencies {
  selectedCatalogEntity: IComputedValue<CatalogEntity | undefined>;
  hideEntityDetails: HideEntityDetails;
  catalogEntityRegistry: CatalogEntityRegistry;
}

const NonInjectedCatalogEntityDetailsComponent = observer(({
  selectedCatalogEntity,
  hideEntityDetails,
  catalogEntityRegistry,
}: Dependencies) => {
  const entity = selectedCatalogEntity.get();

  if (!entity) {
    return null;
  }

  return (
    <CatalogEntityDetails
      entity={entity}
      hideDetails={hideEntityDetails}
      onRun={() => catalogEntityRegistry.onRun(entity)}
    />
  );
});

const CatalogEntityDetailsComponent = withInjectables<Dependencies>(NonInjectedCatalogEntityDetailsComponent, {
  getProps: (di, props) => ({
    ...props,
    selectedCatalogEntity: di.inject(selectedCatalogEntityInjectable),
    catalogEntityRegistry: di.inject(catalogEntityRegistryInjectable),
    hideEntityDetails: di.inject(hideEntityDetailsInjectable),
  }),
});

const catalogEntityDetailsComponentInjectable = getInjectable({
  id: "catalog-entity-details-component",
  instantiate: () => ({
    id: "catalog-entity-details-component",
    Component: CatalogEntityDetailsComponent,
    shouldRender: computed(() => true),
  }),
  injectionToken: rootFrameChildComponentInjectionToken,
});

export default catalogEntityDetailsComponentInjectable;
