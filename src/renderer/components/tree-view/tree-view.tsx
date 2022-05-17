/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tree-view.scss";

import React, { useEffect, useRef } from "react";
import { Icon } from "../icon";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import { cssNames } from "../../utils";

import _ from "lodash";
import getDeepDash from "deepdash";

const deepDash = getDeepDash(_);

export interface NavigationTree {
  id: string;
  parentId?: string;
  name: string;
  selected?: boolean;
  children?: NavigationTree[];
}

export interface RecursiveTreeViewProps {
  data: NavigationTree[];
}

function scrollToItem(id: string) {
  document.getElementById(id)?.scrollIntoView();
}

function getSelectedNode(data: NavigationTree[]) {
  return deepDash.findDeep(data, (value, key) => key === "selected" && value === true)?.parent;
}

export function RecursiveTreeView({ data }: RecursiveTreeViewProps) {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const prevData = useRef<NavigationTree[]>(data);

  const handleToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const expandTopLevelNodes = () => {
    setExpanded(data.map(node => node.id));
  };

  const expandParentNode = () => {
    const node = getSelectedNode(data) as any as NavigationTree;
    const id = node?.parentId;

    if (id && !expanded.includes(id)) {
      setExpanded([...expanded, id]);
    }
  };

  const onLabelClick = (event: React.MouseEvent, nodeId: string) => {
    event.preventDefault();
    scrollToItem(nodeId);
  };

  const renderTree = (nodes: NavigationTree[]) => {
    return nodes.map(node => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={node.name}
        onLabelClick={(event) => onLabelClick(event, node.id)}
        className={cssNames({ selected: node.selected })}
        title={node.name}
      >
        {Array.isArray(node.children) ? node.children.map((node) => renderTree([node])) : null}
      </TreeItem>
    ));
  };

  useEffect(() => {
    if (!prevData.current.length) {
      expandTopLevelNodes();
    } else {
      expandParentNode();
    }
    prevData.current = data;
  }, [data]);

  if (!data.length) {
    return null;
  }

  return (
    <TreeView
      data-testid="TreeView"
      className="TreeView"
      expanded={expanded}
      onNodeToggle={handleToggle}
      defaultCollapseIcon={<Icon material="expand_more"/>}
      defaultExpandIcon={<Icon material="chevron_right" />}
    >
      {renderTree(data)}
    </TreeView>
  );
}
