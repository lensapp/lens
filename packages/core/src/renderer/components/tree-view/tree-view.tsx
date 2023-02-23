/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

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
      className={props.classes?.root}
      role="tree"
    >
      {props.children}
    </ul>
  );
}

export interface TreeItemClasses {
  root?: string;
  label?: string;
}

export interface TreeItemProps {
  classes?: TreeItemClasses;
  label: JSX.Element | string;
  testId?: string;
  selected?: boolean;
  onClick?: MouseEventHandler;
}

export function TreeItem(props: TreeItemProps) {
  return (
    <li
      className={cssNames(props.classes?.root, {
        selected: props.selected ?? false,
      })}
      role="treeitem"
      data-testid={props.testId}
      onClick={props.onClick}
    >
      <div className={props.classes?.label}>
        {props.label}
      </div>
    </li>
  );
}

export interface TreeGroupClasses {
  root?: string;
  header?: string;
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
      className={props.classes?.root}
      role="group"
      data-testid={props.testId}
    >
      <div className={props.classes?.header} onClick={() => setExpanded(!expanded)}>
        <div className={props.classes?.iconContainer}>
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
      <div className={props.classes?.contents}>
        {
          expanded
            ? props.children
            : null
        }
      </div>
    </li>
  );
}
