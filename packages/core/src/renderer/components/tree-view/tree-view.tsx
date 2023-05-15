/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./tree-view.module.scss";
import type { MouseEventHandler } from "react";
import React, { useState } from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { Icon } from "@k8slens/icon";

export interface TreeViewClasses {
  root?: string;
}

export interface TreeViewProps {
  classes?: TreeViewClasses;
  children: StrictReactNode;
}

export function TreeView(props: TreeViewProps) {
  const {
    children,
    classes = {},
  } = props;

  return (
    <ul
      className={cssNames(classes.root, styles.treeView)}
      role="tree"
    >
      {children}
    </ul>
  );
}

export interface TreeItemClasses {
  root?: string;
  label?: string;
  selected?: string;
  hover?: string;
  iconContainer?: string;
}

export interface TreeItemProps {
  classes?: TreeItemClasses;
  icon?: JSX.Element;
  label: JSX.Element | string;
  "data-testid"?: string;
  selected?: boolean;
  onClick?: MouseEventHandler;
}

export function TreeItem(props: TreeItemProps) {
  const {
    label,
    "data-testid": dataTestId,
    classes = {},
    icon,
    onClick,
    selected = false,
  } = props;
  const [hovering, setHovering] = useState(false);
  const optionalCssNames: Partial<Record<string, any>> = {};

  if (classes.selected) {
    optionalCssNames[classes.selected] = selected;
  }

  if (classes.hover) {
    optionalCssNames[classes.hover] = hovering;
  }

  return (
    <li
      className={cssNames(classes.root, optionalCssNames, styles.treeItem, {
        [styles.selected]: selected,
      })}
      role="treeitem"
      data-testid={dataTestId}
      onClick={onClick}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={cssNames(classes.iconContainer, styles.iconContainer)}>
        {icon}
      </div>
      <div className={classes.label}>
        {label}
      </div>
    </li>
  );
}

export interface TreeGroupClasses {
  root?: string;
  group?: string;
  iconContainer?: string;
  label?: string;
  contents?: string;
}

export interface TreeGroupProps {
  classes?: TreeGroupClasses;
  children?: JSX.Element[] | JSX.Element;
  defaultExpanded?: boolean;
  label: JSX.Element | string;
  "data-testid"?: string;
  collapseIcon?: JSX.Element;
  expandIcon?: JSX.Element;
}

export function TreeGroup(props: TreeGroupProps) {
  const {
    label,
    "data-testid": dataTestId,
    children,
    classes = {},
    collapseIcon,
    defaultExpanded = true,
    expandIcon,
  } = props;
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <li
      className={cssNames(classes.root, styles.treeGroup)}
      role="group"
      data-testid={dataTestId}
    >
      <div
        className={cssNames(classes.group, styles.group)}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cssNames(classes.iconContainer, styles.iconContainer)}>
          {
            expanded
              ? collapseIcon ?? <Icon material="expand_more" />
              : expandIcon ?? <Icon material="chevron_right" />
          }
        </div>
        <div className={classes.label}>
          {label}
        </div>
      </div>
      <ul
        className={cssNames(classes.contents, styles.contents, {
          [styles.expanded]: expanded,
        })}
      >
        {children}
      </ul>
    </li>
  );
}
