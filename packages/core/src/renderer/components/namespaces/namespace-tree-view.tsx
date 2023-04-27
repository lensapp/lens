/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./namespace-tree-view.module.scss";

import { SvgIcon } from "@material-ui/core";
import { TreeItem, TreeView } from "@material-ui/lab";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { Link } from "react-router-dom";
import type { Namespace } from "@k8slens/kube-object";
import { DrawerTitle } from "../drawer";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import { SubnamespaceBadge } from "./subnamespace-badge";
import hierarchicalNamespacesInjectable from "./hierarchical-namespaces.injectable";
import { prevDefault } from "@k8slens/utilities";
import type { NamespaceTree } from "./store";

interface NamespaceTreeViewProps {
  tree: NamespaceTree;
}

interface Dependencies {
  namespaces: Namespace[];
  getDetailsUrl: GetDetailsUrl;
}

function NonInjectableNamespaceTreeView({ tree, namespaces, getDetailsUrl }: Dependencies & NamespaceTreeViewProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(namespaces.map(ns => ns.getId()));
  const classes = { group: styles.group, label: styles.label };

  function renderTree(nodes: NamespaceTree) {
    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id}
        data-testid={`namespace-${nodes.id}`}
        classes={classes}
        onIconClick={prevDefault(() => toggleNode(nodes.id))}
        label={(
          <>
            <Link key={nodes.namespace.getId()} to={getDetailsUrl(nodes.namespace.selfLink)}>
              {nodes.namespace.getName()}
            </Link>
            {" "}
            {nodes.namespace.isSubnamespace() && (
              <SubnamespaceBadge id={`namespace-details-badge-for-${nodes.namespace.getId()}`} />
            )}
          </>
        )}
      >
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );
  }

  function toggleNode(id: string) {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(item => item !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  }

  return (
    <div data-testid="namespace-tree-view" className={styles.TreeView}>
      <DrawerTitle>Tree View</DrawerTitle>
      <TreeView
        defaultExpanded={[tree.id]}
        defaultCollapseIcon={<MinusSquareIcon />}
        defaultExpandIcon={<PlusSquareIcon />}
        defaultEndIcon={(<div style={{ opacity: 0.3 }}><MinusSquareIcon /></div>)}
        expanded={expandedItems}
      >
        {renderTree(tree)}
      </TreeView>
    </div>
  );
}

function MinusSquareIcon() {
  return (
    <SvgIcon style={{ width: 14, height: 14 }} data-testid="minus-square">
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquareIcon() {
  return (
    <SvgIcon style={{ width: 14, height: 14 }} data-testid="plus-square">
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

export const NamespaceTreeView = withInjectables<Dependencies, NamespaceTreeViewProps>(NonInjectableNamespaceTreeView, {
  getProps: (di, props) => ({
    namespaces: di.inject(hierarchicalNamespacesInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    ...props,
  }),
});
