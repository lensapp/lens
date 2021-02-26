import React from "react";
import TreeMenu from "react-simple-tree-menu";
import { Icon } from "../icon";

export interface NavigationTree {
  key: string;
  label: string;
  nodes?: NavigationTree[];
}

interface Props {
  data: NavigationTree[]
}

export function RecursiveTreeView({ data }: Props) {
  return (
    <TreeMenu
      data={data}
      hasSearch={false}
      initialActiveKey="application/appearance"
      resetOpenNodesOnDataUpdate={true}
      debounceTime={125}
    />
  );
}
