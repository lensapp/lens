/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./menu-actions.scss";

import React, { isValidElement, useState } from "react";
import { observer } from "mobx-react";
import { cssNames, noop } from "../../utils";
import type { ConfirmDialogParams } from "../confirm-dialog";
import { Icon, IconProps } from "../icon";
import { Menu, MenuItem, MenuProps } from "./menu";
import isString from "lodash/isString";
import { withInjectables } from "@ogre-tools/injectable-react";
import openConfirmDialogInjectable from "../confirm-dialog/dialog-open.injectable";
import uniqueIdInjectable from "../../../common/utils/unique-id.injectable";

export interface MenuActionsProps extends Partial<MenuProps> {
  className?: string;
  toolbar?: boolean; // display menu as toolbar with icons
  autoCloseOnSelect?: boolean;
  triggerIcon?: string | IconProps | React.ReactNode;
  removeConfirmationMessage?: React.ReactNode | (() => React.ReactNode);
  updateAction?: () => void | Promise<void>;
  removeAction?: () => void | Promise<void>;
  onOpen?(): void;
}

interface Dependencies {
  openConfirmDialog: (params: ConfirmDialogParams) => void;
  uniqueId: (prefix: string) => string;
}

const NonInjectedMenuActions = observer(({ openConfirmDialog, uniqueId, ...props }: Dependencies & MenuActionsProps) => {
  const {
    className,
    autoCloseOnSelect = false,
    triggerIcon = "more_vert",
    removeConfirmationMessage = "Remove item?",
    updateAction,
    removeAction,
    onOpen = noop,
    toolbar,
    children,
    ...menuProps
  } = props;
  const autoClose = !toolbar;
  const [id] = useState(uniqueId("menu_actions_"));
  const [isOpen, setIsOpen] = useState(toolbar);

  const toggle = () => {
    setIsOpen(toolbar ||!isOpen);
  };

  const remove = () => {
    const { removeAction } = props;
    const message = typeof removeConfirmationMessage === "function"
      ? removeConfirmationMessage()
      : removeConfirmationMessage;

    openConfirmDialog({
      ok: removeAction,
      labelOk: "Remove",
      message,
    });
  };

  const renderTriggerIcon = () => {
    let className: string;

    if (isValidElement<HTMLElement>(triggerIcon)) {
      className = cssNames(triggerIcon.props.className, { active: isOpen });

      return React.cloneElement(triggerIcon, { id, className } as any);
    }
    const iconProps: Partial<IconProps> = {
      id,
      interactive: true,
      material: isString(triggerIcon) ? triggerIcon : undefined,
      active: isOpen,
      ...(typeof triggerIcon === "object" ? triggerIcon : {}),
    };

    if (onOpen) {
      iconProps.onClick = onOpen;
    }

    if (iconProps.tooltip && isOpen) {
      delete iconProps.tooltip; // don't show tooltip for icon when menu is open
    }

    return (
      <Icon {...iconProps}/>
    );
  };

  return (
    <>
      {!toolbar && renderTriggerIcon()}

      <Menu
        htmlFor={id}
        isOpen={isOpen}
        open={toggle}
        close={toggle}
        className={cssNames("MenuActions flex", className, {
          toolbar,
          gaps: toolbar, // add spacing for .flex
        })}
        usePortal={autoClose}
        closeOnScroll={autoClose}
        closeOnClickItem={autoCloseOnSelect ?? autoClose }
        closeOnClickOutside={autoClose}
        {...menuProps}
      >
        {children}
        {updateAction && (
          <MenuItem onClick={updateAction}>
            <Icon material="edit" interactive={toolbar} tooltip="Edit"/>
            <span className="title">Edit</span>
          </MenuItem>
        )}
        {removeAction && (
          <MenuItem onClick={remove} data-testid="menu-action-remove">
            <Icon material="delete" interactive={toolbar} tooltip="Delete"/>
            <span className="title">Delete</span>
          </MenuItem>
        )}
      </Menu>
    </>
  );
});

export const MenuActions = withInjectables<Dependencies, MenuActionsProps>(NonInjectedMenuActions, {
  getProps: (di, props) => ({
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    uniqueId: di.inject(uniqueIdInjectable),
    ...props,
  }),
});
