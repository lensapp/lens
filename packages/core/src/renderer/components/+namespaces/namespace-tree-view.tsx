import { alpha, SvgIcon, withStyles } from "@material-ui/core";
import { TreeItem, TreeItemProps, TreeView } from "@material-ui/lab";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import { DrawerTitle } from "../drawer";
import type { NamespaceStore } from "./store";
import namespaceStoreInjectable from "./store.injectable";

interface NamespaceTreeViewProps {
  root: Namespace;
}

interface Dependencies {
  namespaceStore: NamespaceStore;
}

function NonInjectableNamespaceTreeView({ root, namespaceStore }: Dependencies & NamespaceTreeViewProps) {
  const hierarchicalNamespaces = namespaceStore.getByLabel(["hnc.x-k8s.io/included-namespace=true"]);
  const expandedItems = hierarchicalNamespaces.map(ns => `namespace-${ns.getId()}`);

  function renderBadge(namespace: Namespace) {
    if (!namespace.getAnnotations().find(annotation => annotation.includes("hnc.x-k8s.io/subnamespace-of"))) {
      return null;
    }

    return <span data-testid={`subnamespace-badge-for-${namespace.getId()}`}>S</span>;
  }

  function renderChildren(parent: Namespace) {
    const children = hierarchicalNamespaces.filter(ns =>
      ns.getLabels().find(label => label === `${parent.getName()}.tree.hnc.x-k8s.io/depth=1`)
    );

    return children.map(child => (
      <StyledTreeItem
        key={`namespace-${child.getId()}`}
        nodeId={`namespace-${child.getId()}`}
        data-testid={`namespace-${child.getId()}`}
        label={(
          <>
            {child.getName()}
            {renderBadge(child)}
          </>
        )}
      >
        {renderChildren(child)}
      </StyledTreeItem>
    ));
  }

  if (!root.getLabels().find(label => label === "hnc.x-k8s.io/included-namespace=true")) {
    return null;
  }

  return (
    <div data-testid="namespace-tree-view">
      <DrawerTitle>Tree View</DrawerTitle>
      <TreeView
        defaultExpanded={[`namespace-${root.getId()}`]}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
        expanded={expandedItems}
      >
        <StyledTreeItem
          nodeId={`namespace-${root.getId()}`}
          label={root.getName()}
          data-testid={`namespace-${root.getId()}`}
        >
          {renderChildren(root)}
        </StyledTreeItem>
      </TreeView>
    </div>
  )
}

function MinusSquare() {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare() {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare() {
  return (
    <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }}>
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

const StyledTreeItem = withStyles((theme) => ({
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 8,
    paddingLeft: 16,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}))((props: TreeItemProps) => <TreeItem {...props} />);

export const NamespaceTreeView = withInjectables<Dependencies, NamespaceTreeViewProps>(NonInjectableNamespaceTreeView, {
  getProps: (di, props) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    ...props,
  }),
});
