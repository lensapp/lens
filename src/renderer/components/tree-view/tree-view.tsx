import "./tree-view.scss";

import React from "react";
import { Icon } from "../icon";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import { cssNames } from "../../utils";

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
        className={cssNames({selected: node.selected})}
      >
        {Array.isArray(node.children) ? node.children.map((node) => renderTree([node])) : null}
      </TreeItem>
    ));
  };

  return (
    <TreeView
      className="TreeView"
      defaultCollapseIcon={<Icon material="expand_more"/>}
      defaultExpandIcon={<Icon material="chevron_right" />}
    >
      {renderTree(data)}
    </TreeView>
  );
}
