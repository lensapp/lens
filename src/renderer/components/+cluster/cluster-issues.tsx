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

import "./cluster-issues.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { computed, makeObservable } from "mobx";
import { Icon } from "../icon";
import { SubHeader } from "../layout/sub-header";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { boundMethod, cssNames, prevDefault } from "../../utils";
import type { ItemObject } from "../../item.store";
import { Spinner } from "../spinner";
import { ThemeStore } from "../../theme.store";
import { lookupApiLink } from "../../api/kube-api";
import { kubeSelectedUrlParam, showDetails } from "../kube-object";
import { kubeWatchApi } from "../../api/kube-watch-api";

interface Props {
  className?: string;
}

interface IWarning extends ItemObject {
  kind: string;
  message: string;
  selfLink: string;
  age: string | number;
  timeDiffFromNow: number;
}

enum sortBy {
  type = "type",
  object = "object",
  age = "age",
}

@observer
export class ClusterIssues extends React.Component<Props> {
  private sortCallbacks = {
    [sortBy.type]: (warning: IWarning) => warning.kind,
    [sortBy.object]: (warning: IWarning) => warning.getName(),
    [sortBy.age]: (warning: IWarning) => warning.timeDiffFromNow,
  };

  constructor(props: Props) {
    super(props);
    makeObservable(this);

    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([eventStore, nodesStore])
    ]);
  }

  @computed get warnings() {
    const warnings: IWarning[] = [];

    // Node bad conditions
    nodesStore.items.forEach(node => {
      const { kind, selfLink, getId, getName, getAge, getTimeDiffFromNow } = node;

      node.getWarningConditions().forEach(({ message }) => {
        warnings.push({
          age: getAge(),
          getId,
          getName,
          timeDiffFromNow: getTimeDiffFromNow(),
          kind,
          message,
          selfLink,
        });
      });
    });

    // Warning events for Workloads
    const events = eventStore.getWarnings();

    events.forEach(error => {
      const { message, involvedObject, getAge, getTimeDiffFromNow } = error;
      const { uid, name, kind } = involvedObject;

      warnings.push({
        getId: () => uid,
        getName: () => name,
        timeDiffFromNow: getTimeDiffFromNow(),
        age: getAge(),
        message,
        kind,
        selfLink: lookupApiLink(involvedObject, error),
      });
    });

    return warnings;
  }

  @boundMethod
  getTableRow(uid: string) {
    const { warnings } = this;
    const warning = warnings.find(warn => warn.getId() == uid);
    const { getId, getName, message, kind, selfLink, age } = warning;

    return (
      <TableRow
        key={getId()}
        sortItem={warning}
        selected={selfLink === kubeSelectedUrlParam.get()}
        onClick={prevDefault(() => showDetails(selfLink))}
      >
        <TableCell className="message">
          {message}
        </TableCell>
        <TableCell className="object">
          {getName()}
        </TableCell>
        <TableCell className="kind">
          {kind}
        </TableCell>
        <TableCell className="age">
          {age}
        </TableCell>
      </TableRow>
    );
  }

  renderContent() {
    const { warnings } = this;

    if (!eventStore.isLoaded) {
      return (
        <Spinner center/>
      );
    }

    if (!warnings.length) {
      return (
        <div className="no-issues flex column box grow gaps align-center justify-center">
          <div><Icon material="check" big sticker/></div>
          <div className="ok-title">No issues found</div>
          <span>Everything is fine in the Cluster</span>
        </div>
      );
    }

    return (
      <>
        <SubHeader>
          <Icon material="error_outline"/>{" "}
          <>Warnings: {warnings.length}</>
        </SubHeader>
        <Table
          tableId="cluster_issues"
          items={warnings}
          virtual
          selectable
          sortable={this.sortCallbacks}
          sortByDefault={{ sortBy: sortBy.object, orderBy: "asc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className={cssNames("box grow", ThemeStore.getInstance().activeTheme.type)}
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
      <div className={cssNames("ClusterIssues flex column", this.props.className)}>
        {this.renderContent()}
      </div>
    );
  }
}
