import React from "react";
import { observer } from "mobx-react";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { WorkspaceId, workspaceStore } from "../../../common/workspace-store";

export const clusterContext = React.createContext(getClusterContext());

export interface ClusterContextValue {
  workspaceId: WorkspaceId;
  clusterId?: ClusterId;
}

export function getClusterContext(): ClusterContextValue {
  return {
    clusterId: clusterStore.activeCluster,
    workspaceId: workspaceStore.currentWorkspace,
  }
}

@observer
export class ClusterContext extends React.Component {
  render() {
    const { Provider } = clusterContext;
    return (
      <Provider value={getClusterContext()}>
        {this.props.children}
      </Provider>
    )
  }
}
