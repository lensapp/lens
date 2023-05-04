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
import { withInjectables } from "@ogre-tools/injectable-react";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";

export interface CatalogAddButtonProps {
  category: CatalogCategory;
}

type CategoryId = string;

interface Dependencies {
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

  updateMenuItems = action(() => {
    this.menuItems.clear();
    this.updateCategoryItems(this.props.category);
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
    const clickAction = defaultAction ?? this.items[0]?.onClick;

    void clickAction?.();
  };

  get items() {
    return this.getCategoryFilteredItems(this.props.category);
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
    navigate: di.inject(navigateInjectable),
  }),
});
