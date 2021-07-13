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
  parentId: string;
  name: string;
  selected?: boolean;
  children?: NavigationTree[];
}

interface Props {
  data: NavigationTree[]
}

function scrollToItem(id: string) {
  document.getElementById(id)?.scrollIntoView();
}

function getSelectedNode(data: NavigationTree[]) {
  return deepDash.findDeep(data, (value, key) => key === "selected" && value === true)?.parent;
}

export function RecursiveTreeView({ data }: Props) {
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
        className={cssNames({selected: node.selected})}
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
