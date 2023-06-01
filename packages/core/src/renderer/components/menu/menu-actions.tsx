/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./menu-actions.scss";

import React, { isValidElement } from "react";
import { observable, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import type { IconProps } from "@k8slens/icon";
import { Icon } from "@k8slens/icon";
import type { MenuProps } from "./menu";
import { Menu, MenuItem } from "./menu";
import isString from "lodash/isString";
import type { TooltipDecoratorProps } from "@k8slens/tooltip";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import { getRandomIdInjectionToken } from "@k8slens/random";
import autoBindReact from "auto-bind/react";

export interface MenuActionsProps extends Partial<MenuProps> {
  className?: string;
  toolbar?: boolean; // display menu as toolbar with icons
  autoCloseOnSelect?: boolean;
  triggerIcon?: string | (IconProps & TooltipDecoratorProps) | StrictReactNode;
  /**
   * @deprecated Provide your own remove `<MenuItem>` as part of the `children` passed to this component
   */
  removeConfirmationMessage?: StrictReactNode | (() => StrictReactNode);
  /**
   * @deprecated Provide your own update `<MenuItem>` as part of the `children` passed to this component
   */
  updateAction?: () => void | Promise<void>;
  /**
   * @deprecated Provide your own remove `<MenuItem>` as part of the `children` passed to this component
   */
  removeAction?: () => void | Promise<void>;
  onOpen?: () => void;
  id?: string;
}

interface Dependencies {
  openConfirmDialog: OpenConfirmDialog;
}

@observer
class NonInjectedMenuActions extends React.Component<MenuActionsProps & Dependencies> {
  static defaultProps = {
    removeConfirmationMessage: "Remove item?",
  };

  @observable isOpen = !!this.props.toolbar;

  toggle = () => {
    if (this.props.toolbar) return;
    this.isOpen = !this.isOpen;
  };

  constructor(props: MenuActionsProps & Dependencies) {
    super(props);
    makeObservable(this);
    autoBindReact(this);
  }

  componentDidMount(): void {
    disposeOnUnmount(this, [
      reaction(() => this.isOpen, (isOpen) => {
        if (isOpen) {
          this.props.onOpen?.();
        }
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  remove() {
    const { removeAction, openConfirmDialog } = this.props;
    let { removeConfirmationMessage } = this.props;

    if (typeof removeConfirmationMessage === "function") {
      removeConfirmationMessage = removeConfirmationMessage();
    }
    openConfirmDialog({
      ok: removeAction,
      labelOk: "Remove",
      message: <div>{removeConfirmationMessage}</div>,
    });
  }

  renderTriggerIcon() {
    const {
      triggerIcon = "more_vert",
      toolbar,
      "data-testid": dataTestId,
    } = this.props;

    if (toolbar) {
      return null;
    }

    if (isValidElement<HTMLElement>(triggerIcon)) {
      const className = cssNames(triggerIcon.props.className, { active: this.isOpen });

      return React.cloneElement(triggerIcon, { id: this.props.id, className });
    }

    const iconProps: IconProps & TooltipDecoratorProps = {
      id: this.props.id,
      interactive: true,
      material: isString(triggerIcon) ? triggerIcon : undefined,
      active: this.isOpen,
      ...(typeof triggerIcon === "object" ? triggerIcon : {}),
    };

    if (dataTestId) {
      iconProps["data-testid"] = `icon-for-${dataTestId}`;
    }

    if (iconProps.tooltip && this.isOpen) {
      delete iconProps.tooltip; // don't show tooltip for icon when menu is open
    }

    return (
      <Icon {...iconProps}/>
    );
  }

  render() {
    const {
      className, toolbar, autoCloseOnSelect, children, updateAction, removeAction, triggerIcon, removeConfirmationMessage,
      ...menuProps
    } = this.props;
    const autoClose = !toolbar;

    return (
      <>
        {this.renderTriggerIcon()}

        <Menu
          htmlFor={this.props.id}
          isOpen={this.isOpen}
          open={this.toggle}
          close={this.toggle}
          className={cssNames("MenuActions flex", className, {
            toolbar,
            gaps: toolbar, // add spacing for .flex
          })}
          animated={!toolbar}
          usePortal={autoClose}
          closeOnScroll={autoClose}
          closeOnClickItem={autoCloseOnSelect ?? autoClose}
          closeOnClickOutside={autoClose}
          {...menuProps}
        >
          {children}
          {updateAction && (
            <MenuItem onClick={updateAction}>
              <Icon
                material="edit"
                interactive={toolbar}
                tooltip="Edit"
              />
              <span className="title">Edit</span>
            </MenuItem>
          )}
          {removeAction && (
            <MenuItem onClick={this.remove} data-testid="menu-action-remove">
              <Icon
                material="delete"
                interactive={toolbar}
                tooltip="Delete"
              />
              <span className="title">Delete</span>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}

export const MenuActions = withInjectables<Dependencies, MenuActionsProps>(NonInjectedMenuActions, {
  getProps: (di, props) => ({
    id: di.inject(getRandomIdInjectionToken)(),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    ...props,
  }),
});
