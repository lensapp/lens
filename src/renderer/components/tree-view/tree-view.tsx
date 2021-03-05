import "./tree-view.scss";

import React from "react";
import { Icon } from "../icon";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import { cssNames } from "../../utils";
import flattenDeep from "lodash/flattenDeep";

export interface NavigationTree {
  id: string;
  name: string;
  selected?: boolean;
  children?: NavigationTree[];
}

interface Props {
  data: NavigationTree[]
}

export function RecursiveTreeView({ data }: Props) {
  const renderTree = (nodes: NavigationTree[]) => {
    return nodes.map(node => (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={node.name}
        onLabelClick={() => scrollToItem(node.id)}
        className={cssNames({selected: node.selected})}
      >
        {Array.isArray(node.children) ? node.children.map((node) => renderTree([node])) : null}
      </TreeItem>
    ));
  };

  const scrollToItem = (id: string) => {
    const element = document.getElementById(id);

    element?.scrollIntoView();
  };

  const getAllNodeIds = (nodes: NavigationTree[]): string[] => {
    return flattenDeep(nodes.map(node => {
      return [node.id, ...node.children.map(item => getAllNodeIds([item]))];
    }));
  };

  if (!data.length) {
    return null;
  }

  return (
    <TreeView
      className="TreeView"
      defaultExpanded={getAllNodeIds(data)}
      defaultCollapseIcon={<Icon material="expand_more"/>}
      defaultExpandIcon={<Icon material="chevron_right" />}
    >
      {renderTree(data)}
    </TreeView>
  );
}
