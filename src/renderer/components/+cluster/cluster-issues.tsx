/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-issues.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { computed, makeObservable } from "mobx";
import { Icon } from "../icon";
import { SubHeader } from "../layout/sub-header";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { cssNames, prevDefault } from "../../utils";
import type { ItemObject } from "../../../common/item.store";
import { Spinner } from "../spinner";
import type { ThemeStore } from "../../themes/store";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { KubeObjectAge } from "../kube-object/age";
import { withInjectables } from "@ogre-tools/injectable-react";
import themeStoreInjectable from "../../themes/store.injectable";
import type { NodeStore } from "../+nodes/store";
import type { EventStore } from "../+events/store";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import eventStoreInjectable from "../+events/store.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";
import type { PageParam } from "../../navigation";
import type { ToggleDetails } from "../kube-detail-params/toggle-details.injectable";
import kubeSelectedUrlParamInjectable from "../kube-detail-params/kube-selected-url.injectable";
import toggleDetailsInjectable from "../kube-detail-params/toggle-details.injectable";

export interface ClusterIssuesProps {
  className?: string;
}

interface Warning extends ItemObject {
  kind: string;
  message: string | undefined;
  selfLink: string;
  renderAge: () => React.ReactElement;
  ageMs: number;
}

enum sortBy {
  type = "type",
  object = "object",
  age = "age",
}

interface Dependencies {
  themeStore: ThemeStore;
  nodeStore: NodeStore;
  eventStore: EventStore;
  apiManager: ApiManager;
  kubeSelectedUrlParam: PageParam<string>;
  toggleDetails: ToggleDetails;
}

@observer
class NonInjectedClusterIssues extends React.Component<ClusterIssuesProps & Dependencies> {
  constructor(props: ClusterIssuesProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get warnings(): Warning[] {
    return [
      ...this.props.nodeStore.items.flatMap(node => (
        node.getWarningConditions()
          .map(({ message }) => ({
            selfLink: node.selfLink,
            getId: node.getId,
            getName: node.getName,
            kind: node.kind,
            message,
            renderAge: () => <KubeObjectAge key="age" object={node} />,
            ageMs: -node.getCreationTimestamp(),
          }))
      )),
      ...this.props.eventStore.getWarnings().map(warning => ({
        getId: () => warning.involvedObject.uid,
        getName: () => warning.involvedObject.name,
        renderAge: () => <KubeObjectAge key="age" object={warning} />,
        ageMs: -warning.getCreationTimestamp(),
        message: warning.message,
        kind: warning.kind,
        selfLink: this.props.apiManager.lookupApiLink(warning.involvedObject, warning),
      })),
    ];
  }

  getTableRow = (uid: string) => {
    const { warnings } = this;
    const { kubeSelectedUrlParam, toggleDetails } = this.props;
    const warning = warnings.find(warn => warn.getId() == uid);

    if (!warning) {
      return undefined;
    }

    const { getId, getName, message, kind, selfLink, renderAge } = warning;

    return (
      <TableRow
        key={getId()}
        sortItem={warning}
        selected={selfLink === kubeSelectedUrlParam.get()}
        onClick={prevDefault(() => toggleDetails(selfLink))}
      >
        <TableCell className={styles.message}>
          {message ?? "<unknown>"}
        </TableCell>
        <TableCell className={styles.object}>
          {getName()}
        </TableCell>
        <TableCell className="kind">
          {kind}
        </TableCell>
        <TableCell className="age">
          {renderAge()}
        </TableCell>
      </TableRow>
    );
  };

  renderContent() {
    const { warnings } = this;

    if (!this.props.eventStore.isLoaded) {
      return (
        <Spinner center/>
      );
    }

    if (!warnings.length) {
      return (
        <div className={cssNames(styles.noIssues, "flex column box grow gaps align-center justify-center")}>
          <Icon
            className={styles.Icon}
            material="check"
            big
            sticker
          />
          <p className={styles.title}>No issues found</p>
          <p>Everything is fine in the Cluster</p>
        </div>
      );
    }

    return (
      <>
        <SubHeader className={styles.SubHeader}>
          <Icon material="error_outline"/>
          {` Warnings: ${warnings.length}`}
        </SubHeader>
        <Table
          tableId="cluster_issues"
          items={warnings}
          virtual
          selectable
          sortable={{
            [sortBy.type]: warning => warning.kind,
            [sortBy.object]: warning => warning.getName(),
            [sortBy.age]: warning => warning.ageMs,
          }}
          sortByDefault={{ sortBy: sortBy.object, orderBy: "asc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className={cssNames("box grow", this.props.themeStore.activeTheme.type)}
        >
          <TableHead nowrap>
            <TableCell className="message">Message</TableCell>
            <TableCell className="object" sortBy={sortBy.object}>Object</TableCell>
            <TableCell className="kind" sortBy={sortBy.type}>Type</TableCell>
            <TableCell className="timestamp" sortBy={sortBy.age}>Age</TableCell>
          </TableHead>
        </Table>
      </>
    );
  }

  render() {
    return (
      <div className={cssNames(styles.ClusterIssues, "flex column", this.props.className)}>
        {this.renderContent()}
      </div>
    );
  }
}

export const ClusterIssues = withInjectables<Dependencies, ClusterIssuesProps>(NonInjectedClusterIssues, {
  getProps: (di, props) => ({
    ...props,
    themeStore: di.inject(themeStoreInjectable),
    apiManager: di.inject(apiManagerInjectable),
    eventStore: di.inject(eventStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
    kubeSelectedUrlParam: di.inject(kubeSelectedUrlParamInjectable),
    toggleDetails: di.inject(toggleDetailsInjectable),
  }),
});
