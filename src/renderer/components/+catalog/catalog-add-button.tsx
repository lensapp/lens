/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./catalog-add-button.scss";
import React, { useEffect, useState } from "react";
import { SpeedDial, SpeedDialAction } from "@material-ui/lab";
import { Icon } from "../icon";
import { observer } from "mobx-react";
import { observable, action, IComputedValue } from "mobx";
import { navigate } from "../../navigation";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CatalogCategory, CatalogEntityAddMenu } from "../../../common/catalog";
import catalogCategoriesInjectable from "../../catalog/categories.injectable";

export interface CatalogAddButtonProps  {
  category: CatalogCategory;
}

interface Dependencies {
  categories: IComputedValue<CatalogCategory[]>;
}

const NonInjectedCatalogAddButton = observer(({ categories, category }: Dependencies & CatalogAddButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems] = useState(observable.map<string, CatalogEntityAddMenu[]>());

  const updateMenuItems = action((category: CatalogCategory) => {
    menuItems.clear();

    if (category) {
      updateCategoryItems(category);
    } else {
      // Show menu items from all categories
      categories.get().forEach(updateCategoryItems);
    }
  });

  const updateCategoryItems = action((category: CatalogCategory) => {
    menuItems.set(category.getId(), []);
    category.emit("catalogAddMenu", {
      navigate: (url: string) => navigate(url),
      menuItems: menuItems.get(category.getId()),
    });
  });

  useEffect(() => updateMenuItems(category), [category]);

  const getCategoryFilteredItems = (category: CatalogCategory) => {
    return category.filteredItems(menuItems.get(category.getId()) || []);
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const onButtonClick =() =>{
    const defaultAction = items.find(item => item.defaultAction)?.onClick;
    const clickAction = defaultAction || (items.length === 1 ? items[0].onClick : null);

    clickAction?.();
  };

  const items = category
    ? getCategoryFilteredItems(category)
    : categories.get().flatMap(getCategoryFilteredItems);

  if (items.length === 0) {
    return null;
  }

  return (
    <SpeedDial
      className="CatalogAddButton"
      ariaLabel="SpeedDial CatalogAddButton"
      open={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      icon={<Icon material="add" />}
      direction="up"
      onClick={onButtonClick}
    >
      {items.map((menuItem, index) => (
        <SpeedDialAction
          key={index}
          icon={<Icon material={menuItem.icon} />}
          tooltipTitle={menuItem.title}
          onClick={(evt) => {
            evt.stopPropagation();
            menuItem.onClick();
          } }
          TooltipClasses={{
            popper: "catalogSpeedDialPopper",
          }}
        />
      ))}
    </SpeedDial>
  );
});

export const CatalogAddButton = withInjectables<Dependencies, CatalogAddButtonProps>(NonInjectedCatalogAddButton, {
  getProps: (di, props) => ({
    categories: di.inject(catalogCategoriesInjectable),
    ...props,
  }),
});
