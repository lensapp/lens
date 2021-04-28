import "./cluster-issues.scss";

import React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { Icon } from "../icon";
import { SubHeader } from "../layout/sub-header";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { cssNames } from "../../utils";
import { Spinner } from "../spinner";
import { lookupApiLink } from "../../api/kube-api";
import { ReactiveTable } from "../reactive-table/reactive-table";
import { Column } from "react-table";

interface Props {
  className?: string;
}

interface IWarning {
  kind: string;
  id: string;
  name: string;
  message: string;
  selfLink: string;
  age: string | number;
  timeDiffFromNow: number;
}

// enum sortBy {
//   type = "type",
//   object = "object",
//   age = "age",
// }

@observer
export class ClusterIssues extends React.Component<Props> {
  // private sortCallbacks = {
  //   [sortBy.type]: (warning: IWarning) => warning.kind,
  //   [sortBy.object]: (warning: IWarning) => warning.getName(),
  //   [sortBy.age]: (warning: IWarning) => warning.timeDiffFromNow,
  // };

  @computed get warnings() {
    const warnings: IWarning[] = [];

    // Node bad conditions
    nodesStore.items.forEach(node => {
      const { kind, selfLink, getId, getName, getAge, getTimeDiffFromNow } = node;

      node.getWarningConditions().forEach(({ message }) => {
        warnings.push({
          age: getAge(),
          id: getId(),
          name: getName(),
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
        id: uid,
        name,
        timeDiffFromNow: getTimeDiffFromNow(),
        age: getAge(),
        message,
        kind,
        selfLink: lookupApiLink(involvedObject, error),
      });
    });

    return warnings;
  }

  columns: Column<IWarning>[] = [
    {
      id: "message",
      Header: "Message",
      accessor: "message",
    },
    {
      id: "name",
      Header: "Object Name",
      accessor: "name",
    },
    {
      id: "kind",
      Header: "Kind",
      accessor: "kind",
    },
    {
      id: "age",
      Header: "Age",
      accessor: "age",
    },
  ];

  // @autobind()
  // getTableRow(uid: string) {
  //   const { warnings } = this;
  //   const warning = warnings.find(warn => warn.getId() == uid);
  //   const { getId, getName, message, kind, selfLink, age } = warning;

  //   return (
  //     <TableRow
  //       key={getId()}
  //       sortItem={warning}
  //       selected={selfLink === kubeSelectedUrlParam.get()}
  //       onClick={prevDefault(() => showDetails(selfLink))}
  //     >
  //       <TableCell className="message">
  //         {message}
  //       </TableCell>
  //       <TableCell className="object">
  //         {getName()}
  //       </TableCell>
  //       <TableCell className="kind">
  //         {kind}
  //       </TableCell>
  //       <TableCell className="age">
  //         {age}
  //       </TableCell>
  //     </TableRow>
  //   );
  // }

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
        <ReactiveTable
          columns={this.columns}
          data={this.warnings}
        />
        {/* <Table
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
        </Table> */}
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
