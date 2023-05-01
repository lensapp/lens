/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./catalog-add-button.scss";
import React from "react";
import { SpeedDial, SpeedDialAction } from "@material-ui/lab";
import { Icon } from "@k8slens/icon";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import type { CatalogCategory, CatalogEntityAddMenu } from "../../api/catalog-entity";
import { EventEmitter } from "events";
import type { CatalogCategoryRegistry } from "../../../common/catalog";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";

export interface CatalogAddButtonProps {
  category: CatalogCategory;
}

type CategoryId = string;

interface Dependencies {
  catalogCategoryRegistry: CatalogCategoryRegistry;
  navigate: Navigate;
}

@observer
class NonInjectedCatalogAddButton extends React.Component<CatalogAddButtonProps & Dependencies> {
  protected readonly isOpen = observable.box(false);
  readonly menuItems = observable.map<CategoryId, CatalogEntityAddMenu[]>();

  componentDidMount() {
    this.updateMenuItems();
  }

  componentDidUpdate(prevProps: CatalogAddButtonProps) {
    if (prevProps.category != this.props.category) {
      this.updateMenuItems();
    }
  }

  get categories() {
    return this.props.catalogCategoryRegistry.filteredItems;
  }

  updateMenuItems = action(() => {
    this.menuItems.clear();

    if (this.props.category) {
      this.updateCategoryItems(this.props.category);
    } else {
      // Show menu items from all categories
      this.categories.forEach(this.updateCategoryItems);
    }
  });

  updateCategoryItems = action((category: CatalogCategory) => {
    if (category instanceof EventEmitter) {
      const menuItems: CatalogEntityAddMenu[] = [];

      category.emit("catalogAddMenu", {
        navigate: this.props.navigate,
        menuItems,
      });
      this.menuItems.set(category.getId(), menuItems);
    }
  });

  getCategoryFilteredItems = (category: CatalogCategory) => {
    return category.filteredItems(this.menuItems.get(category.getId()) || []);
  };

  onOpen = action(() => {
    this.isOpen.set(true);
  });

  onClose = action(() => {
    this.isOpen.set(false);
  });

  onButtonClick = () => {
    const defaultAction = this.items.find(item => item.defaultAction)?.onClick;
    const clickAction = defaultAction || (this.items.length === 1 ? this.items[0].onClick : null);

    void clickAction?.();
  };

  get items() {
    const { category } = this.props;

    return category ? this.getCategoryFilteredItems(category) :
      this.categories.map(this.getCategoryFilteredItems).flat();
  }

  render() {
    if (this.items.length === 0) {
      return null;
    }

    return (
      <SpeedDial
        className="CatalogAddButton"
        ariaLabel="SpeedDial CatalogAddButton"
        open={this.isOpen.get()}
        onOpen={this.onOpen}
        onClose={this.onClose}
        icon={<Icon material="add" />}
        direction="up"
        onClick={this.onButtonClick}
      >
        {this.items.map((menuItem, index) => {
          return (
            <SpeedDialAction
              key={index}
              icon={<Icon material={menuItem.icon}/>}
              tooltipTitle={menuItem.title}
              onClick={(evt) => {
                evt.stopPropagation();
                void menuItem.onClick();
              }}
              TooltipClasses={{
                popper: "catalogSpeedDialPopper",
              }}
            />
          );
        })}
      </SpeedDial>
    );
  }
}

export const CatalogAddButton = withInjectables<Dependencies, CatalogAddButtonProps>(NonInjectedCatalogAddButton, {
  getProps: (di, props) => ({
    ...props,
    catalogCategoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    navigate: di.inject(navigateInjectable),
  }),
});
