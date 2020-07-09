import "./cluster-issues.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Trans } from "@lingui/macro";
import { Icon } from "../icon";
import { SubHeader } from "../layout/sub-header";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { autobind, cssNames, prevDefault } from "../../utils";
import { getSelectedDetails, showDetails } from "../../navigation";
import { ItemObject } from "../../item.store";
import { Spinner } from "../spinner";
import { themeStore } from "../../theme.store";
import { lookupApiLink } from "../../api/kube-api";

interface Props {
  className?: string;
}

interface Warning extends ItemObject {
  kind: string;
  message: string;
  selfLink: string;
}

enum sortBy {
  type = "type",
  object = "object"
}

@observer
export class ClusterIssues extends React.Component<Props> {
  private sortCallbacks = {
    [sortBy.type]: (warning: Warning): string => warning.kind,
    [sortBy.object]: (warning: Warning): string => warning.getName(),
  };

  @computed get warnings(): Warning[] {
    const warnings: Warning[] = [];

    // Node bad conditions
    nodesStore.items.forEach(node => {
      const { kind, selfLink, getId, getName } = node;
      node.getWarningConditions().forEach(({ message }) => {
        warnings.push({
          kind,
          getId,
          getName,
          selfLink,
          message,
        });
      });
    });

    // Warning events for Workloads
    const events = eventStore.getWarnings();
    events.forEach(error => {
      const { message, involvedObject } = error;
      const { uid, name, kind } = involvedObject;
      warnings.push({
        getId: () => uid,
        getName: () => name,
        message,
        kind,
        selfLink: lookupApiLink(involvedObject, error),
      });
    });

    return warnings;
  }

  @autobind()
  getTableRow(uid: string): JSX.Element {
    const { warnings } = this;
    const warning = warnings.find(warn => warn.getId() == uid);
    const { getId, getName, message, kind, selfLink } = warning;
    return (
      <TableRow
        key={getId()}
        sortItem={warning}
        selected={selfLink === getSelectedDetails()}
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
      </TableRow>
    );
  }

  renderContent(): JSX.Element {
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
          <div className="ok-title"><Trans>No issues found</Trans></div>
          <span><Trans>Everything is fine in the Cluster</Trans></span>
        </div>
      );
    }
    return (
      <>
        <SubHeader>
          <Icon material="error_outline"/>{" "}
          <Trans>Warnings: {warnings.length}</Trans>
        </SubHeader>
        <Table
          items={warnings}
          virtual
          selectable
          sortable={this.sortCallbacks}
          sortByDefault={{ sortBy: sortBy.object, orderBy: "asc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className={cssNames("box grow", themeStore.activeTheme.type)}
        >
          <TableHead nowrap>
            <TableCell className="message"><Trans>Message</Trans></TableCell>
            <TableCell className="object" sortBy={sortBy.object}><Trans>Object</Trans></TableCell>
            <TableCell className="kind" sortBy={sortBy.type}><Trans>Type</Trans></TableCell>
          </TableHead>
        </Table>
      </>
    );
  }

  render(): JSX.Element {
    return (
      <div className={cssNames("ClusterIssues flex column", this.props.className)}>
        {this.renderContent()}
      </div>
    );
  }
}
