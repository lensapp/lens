/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./tree-view.module.scss";
import type { MouseEventHandler } from "react";
import React, { useState } from "react";
import { cssNames } from "../../utils";
import { Icon } from "../icon";

export interface TreeViewClasses {
  root?: string;
}

export interface TreeViewProps {
  classes?: TreeViewClasses;
  children: JSX.Element[] | JSX.Element;
}

export function TreeView(props: TreeViewProps) {
  return (
    <ul
      className={cssNames(props.classes?.root, styles.treeView)}
      role="tree"
    >
      {props.children}
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
  testId?: string;
  selected?: boolean;
  onClick?: MouseEventHandler;
}

export function TreeItem(props: TreeItemProps) {
  const [hovering, setHovering] = useState(false);
  const optionalCssNames: Partial<Record<string, any>> = {};

  if (props.classes?.selected) {
    optionalCssNames[props.classes.selected] = props.selected ?? false;
  }

  if (props.classes?.hover) {
    optionalCssNames[props.classes.hover] = hovering;
  }

  return (
    <li
      className={cssNames(props.classes?.root, optionalCssNames, styles.treeItem, {
        [styles.selected]: props.selected ?? false,
      })}
      role="treeitem"
      data-testid={props.testId}
      onClick={props.onClick}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={cssNames(props.classes?.iconContainer, styles.iconContainer)}>
        {props.icon}
      </div>
      <div className={props.classes?.label}>
        {props.label}
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
  testId?: string;
  collapseIcon?: JSX.Element;
  expandIcon?: JSX.Element;
}

export function TreeGroup(props: TreeGroupProps) {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? true);

  return (
    <li
      className={cssNames(props.classes?.root, styles.treeGroup)}
      role="group"
      data-testid={props.testId}
    >
      <div
        className={cssNames(props.classes?.group, styles.group)}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cssNames(props.classes?.iconContainer, styles.iconContainer)}>
          {
            expanded
              ? props.collapseIcon ?? <Icon material="expand_more" />
              : props.expandIcon ?? <Icon material="chevron_right" />
          }
        </div>
        <div className={props.classes?.label}>
          {props.label}
        </div>
      </div>
      <ul
        className={cssNames(props.classes?.contents, styles.contents, {
          [styles.expanded]: expanded,
        })}
      >
        {props.children}
      </ul>
    </li>
  );
}
