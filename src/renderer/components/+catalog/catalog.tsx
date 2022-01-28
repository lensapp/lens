/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { action, IComputedValue, observable, reaction, when } from "mobx";
import type { CatalogEntityStore } from "./entity.store";
import { navigate } from "../../navigation";
import { MenuItem, MenuActions } from "../menu";
import type { CatalogCategory, CatalogEntity, CatalogEntityContextMenu } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";
import type { RouteComponentProps } from "react-router";
import { Notifications } from "../notifications";
import { MainLayout } from "../layout/main-layout";
import { disposer, StorageLayer } from "../../utils";
import { CatalogEntityDetails } from "./catalog-entity-details";
import { browseCatalogTab, catalogURL, CatalogViewRouteParam } from "../../../common/routes";
import { CatalogMenu } from "./catalog-menu";
import { RenderDelay } from "../render-delay/render-delay";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogEntityStoreInjectable from "./entity.store.injectable";
import catalogPreviousActiveTabInjectable from "./catalog-previous-tab.injectable";
import renderEntityContextMenuItemInjectable, { RenderEntityContextMenuItem } from "../../catalog/render-context-menu-item.injectable";
import onRunInjectable from "../../catalog/on-run.injectable";
import catalogCategoriesInjectable from "../../catalog/categories.injectable";
import type { CategoryColumns, GetCategoryColumnsParams } from "./category-columns/get-category-columns.injectable";
import getCategoryColumnsInjectable from "./category-columns/get-category-columns.injectable";

export interface CatalogProps extends RouteComponentProps<CatalogViewRouteParam> {

}

interface Dependencies {
  catalogEntityStore: CatalogEntityStore;
  categories: IComputedValue<CatalogCategory[]>;
  onRun: (entity: CatalogEntity) => void;
  previousActiveTab: StorageLayer<string>;
  renderEntityContextMenuItem: RenderEntityContextMenuItem;
  getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;
}

const NonInjectedCatalog = observer(({
  renderEntityContextMenuItem,
  catalogEntityStore,
  match,
  previousActiveTab,
  onRun,
  categories,
  getCategoryColumns,
}: Dependencies & CatalogProps) => {
  const [contextMenuItems] = useState(observable.array<CatalogEntityContextMenu>());
  const [activeTab, setActiveTab] = useState<string | undefined>();
  const getRouteActiveTab = () => {
    const { group, kind } = match.params ?? {};

    if (group && kind) {
      return `${group}/${kind}`;
    }

    return browseCatalogTab;
  };

  const findCategory = (id: string) => categories.get().find(category => category.getId() === id);

  useEffect(() => {
    contextMenuItems.clear();

    return disposer(
      catalogEntityStore.watch(),
      reaction(() => getRouteActiveTab(), async (routeTab, previousRouteTab) => {
        previousActiveTab.set(previousRouteTab);

        try {
          await when(() => (routeTab === browseCatalogTab || !!findCategory(routeTab)), { timeout: 5_000 }); // we need to wait because extensions might take a while to load
          const item = findCategory(routeTab);

          setActiveTab(routeTab);
          catalogEntityStore.activeCategory = item;
        } catch (error) {
          console.error(error);
          Notifications.error(<p>Unknown category: {routeTab}</p>);
        }
      }, { fireImmediately: true }),
      reaction(() => categories.get(), (categories) => {
        if (!findCategory(catalogEntityStore.activeCategory.getId())) {
          const item = categories[0];

          if (item) {
            setActiveTab(item.getId());
            catalogEntityStore.activeCategory = item;
          }
        }
      }),
    );
  }, []);

  const onTabChange = action((tabId: string | null) => {
    const activeCategory = findCategory(tabId);

    if (activeCategory) {
      navigate(catalogURL({ params: { group: activeCategory.spec.group, kind: activeCategory.spec.names.kind }}));
    } else {
      navigate(catalogURL({ params: { group: browseCatalogTab }}));
    }
  });

  const onDetails = (entity: CatalogEntity) => {
    if (catalogEntityStore.selectedItemId) {
      catalogEntityStore.selectedItemId = null;
    } else {
      onRun(entity);
    }
  };

  const renderItemMenu = (entity: CatalogEntity) => {
    const onOpen = () => {
      contextMenuItems.clear();
      entity.onContextMenuOpen({
        menuItems: contextMenuItems,
        navigate,
      });
    };

    return (
      <MenuActions onOpen={onOpen}>
        <MenuItem key="open-details" onClick={() => catalogEntityStore.selectedItemId = entity.getId()}>
          View Details
        </MenuItem>
        {contextMenuItems.map(renderEntityContextMenuItem("title"))}
        <HotbarToggleMenuItem
          key="hotbar-toggle"
          entity={entity}
          addContent="Add to Hotbar"
          removeContent="Remove from Hotbar"
        />
      </MenuActions>
    );
  };

  const renderList = () => {
    const { activeCategory } = catalogEntityStore;
    const tableId = activeCategory ? `catalog-items-${activeCategory.metadata.name.replace(" ", "")}` : "catalog-items";

    if (activeTab === undefined) {
      return null;
    }

    const { sortingCallbacks, searchFilters, renderTableContents, renderTableHeader } = getCategoryColumns({ activeCategory });

    return (
      <ItemListLayout
        className={styles.Catalog}
        tableId={tableId}
        renderHeaderTitle={activeCategory?.metadata.name ?? "Browse All"}
        isSelectable={false}
        isConfigurable={true}
        store={catalogEntityStore}
        sortingCallbacks={sortingCallbacks}
        searchFilters={searchFilters}
        renderTableHeader={renderTableHeader}
        customizeTableRowProps={entity => ({
          disabled: !entity.isEnabled(),
        })}
        renderTableContents={renderTableContents}
        onDetails={onDetails}
        renderItemMenu={renderItemMenu}
      />
    );
  };

  const selectedEntity = catalogEntityStore.selectedItem;

  return (
    <MainLayout
      sidebar={(
        <CatalogMenu
          activeItem={activeTab}
          onItemClick={onTabChange}
        />
      )}
    >
      <div className="p-6 h-full">
        {renderList()}
      </div>
      {
        selectedEntity
          ? <CatalogEntityDetails
            entity={selectedEntity}
            hideDetails={() => catalogEntityStore.selectedItemId = null}
          />
          : (
            <RenderDelay>
              <CatalogAddButton
                category={catalogEntityStore.activeCategory}
              />
            </RenderDelay>
          )
      }
    </MainLayout>
  );
});

export const Catalog = withInjectables<Dependencies, CatalogProps>(NonInjectedCatalog, {
  getProps: (di, props) => ({
    catalogEntityStore: di.inject(catalogEntityStoreInjectable),
    previousActiveTab: di.inject(catalogPreviousActiveTabInjectable),
    categories: di.inject(catalogCategoriesInjectable),
    onRun: di.inject(onRunInjectable),
    renderEntityContextMenuItem: di.inject(renderEntityContextMenuItemInjectable),
    getCategoryColumns: di.inject(getCategoryColumnsInjectable),
    ...props,
  }),
});
