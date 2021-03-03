import React from "react";
import { Icon } from "../icon";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";

export interface NavigationTree {
  id: string;
  name: string;
  children?: NavigationTree[];
}

interface Props {
  data: NavigationTree[]
}

const useStyles = makeStyles({
  root: {
    height: 110,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export function RecursiveTreeView({ data }: Props) {
  const classes = useStyles();

  const renderTree = (nodes: NavigationTree[]) => {
    return nodes.map(node => (
      <TreeItem key={node.id} nodeId={node.id} label={node.name}>
        {Array.isArray(node.children) ? node.children.map((node) => renderTree([node])) : null}
      </TreeItem>
    ));
  };

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<Icon material="expand_more"/>}
      defaultExpandIcon={<Icon material="chevron_right" />}
    >
      {renderTree(data)}
    </TreeView>
  );
}
