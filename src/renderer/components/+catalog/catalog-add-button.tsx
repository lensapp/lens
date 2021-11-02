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

import "./catalog-add-button.scss";
import React from "react";
import { SpeedDial, SpeedDialAction } from "@material-ui/lab";
import { Icon } from "../icon";
import { observer } from "mobx-react";
import { observable, makeObservable, action } from "mobx";
import { boundMethod } from "../../../common/utils";
import type { CatalogCategory, CatalogEntityAddMenuContext, CatalogEntityAddMenu } from "../../api/catalog-entity";
import { EventEmitter } from "events";
import { navigate } from "../../navigation";
import { catalogCategoryRegistry } from "../../api/catalog-category-registry";

export type CatalogAddButtonProps = {
  category: CatalogCategory
};

@observer
export class CatalogAddButton extends React.Component<CatalogAddButtonProps> {
  @observable protected isOpen = false;
  @observable menuItems: CatalogEntityAddMenu[] = [];

  constructor(props: CatalogAddButtonProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.updateMenuItems();
  }

  componentDidUpdate(prevProps: CatalogAddButtonProps) {
    if (prevProps.category != this.props.category) {
      this.updateMenuItems();
    }
  }

  get categories() {
    return catalogCategoryRegistry.filteredItems;
  }

  updateMenuItems() {
    this.menuItems = [];

    if (this.props.category) {
      this.updateCategoryItems(this.props.category);
    } else {
      // Show menu items from all categories
      this.categories.forEach(this.updateCategoryItems);
    }
  }

  @action
  updateCategoryItems = (category: CatalogCategory) => {
    const context: CatalogEntityAddMenuContext = {
      navigate: (url: string) => navigate(url),
      menuItems: this.menuItems
    };

    if (category instanceof EventEmitter) {
      category.emit("catalogAddMenu", context);
      this.menuItems = category.filteredItems(this.menuItems);
    }
  };

  @boundMethod
  onOpen() {
    this.isOpen = true;
  }

  @boundMethod
  onClose() {
    this.isOpen = false;
  }

  @boundMethod
  onButtonClick() {
    const defaultAction = this.menuItems.find(item => item.defaultAction)?.onClick;
    const clickAction = defaultAction || (this.menuItems.length === 1 ? this.menuItems[0].onClick : null);

    clickAction?.();
  }

  render() {
    if (this.menuItems.length === 0) {
      return null;
    }

    return (
      <SpeedDial
        className="CatalogAddButton"
        ariaLabel="SpeedDial CatalogAddButton"
        open={this.isOpen}
        onOpen={this.onOpen}
        onClose={this.onClose}
        icon={<Icon material="add" />}
        direction="up"
        onClick={this.onButtonClick}
      >
        {this.menuItems.map((menuItem, index) => {
          return <SpeedDialAction
            key={index}
            icon={<Icon material={menuItem.icon}/>}
            tooltipTitle={menuItem.title}
            onClick={(evt) => {
              evt.stopPropagation();
              menuItem.onClick();
            }}
            TooltipClasses={{
              popper: "catalogSpeedDialPopper"
            }}
          />;
        })}
      </SpeedDial>
    );
  }
}
