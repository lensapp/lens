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
import { disposeOnUnmount, observer } from "mobx-react";
import { observable, reaction, makeObservable } from "mobx";
import { boundMethod } from "../../../common/utils";
import type { CatalogCategory, CatalogEntityAddMenuContext, CatalogEntityAddMenu } from "../../api/catalog-entity";
import { EventEmitter } from "events";
import { navigate } from "../../navigation";

export type CatalogAddButtonProps = {
  category: CatalogCategory
};

@observer
export class CatalogAddButton extends React.Component<CatalogAddButtonProps> {
  @observable protected isOpen = false;
  protected menuItems = observable.array<CatalogEntityAddMenu>([]);

  constructor(props: CatalogAddButtonProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.category, (category) => {
        this.menuItems.clear();

        if (category && category instanceof EventEmitter) {
          const context: CatalogEntityAddMenuContext = {
            navigate: (url: string) => navigate(url),
            menuItems: this.menuItems
          };

          category.emit("catalogAddMenu", context);
        }
      }, { fireImmediately: true })
    ]);
  }

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
    if (this.menuItems.length == 1) {
      this.menuItems[0].onClick();
    }
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
        { this.menuItems.map((menuItem, index) => {
          return <SpeedDialAction
            key={index}
            icon={<Icon material={menuItem.icon} />}
            tooltipTitle={menuItem.title}
            onClick={() => menuItem.onClick()}
            TooltipClasses={{
              popper: "catalogSpeedDialPopper"
            }}
          />;
        })}
      </SpeedDial>
    );
  }
}
