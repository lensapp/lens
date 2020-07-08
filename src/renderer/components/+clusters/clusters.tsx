import React from "react";
import { userStore } from "../../../common/user-store";
import { workspaceStore } from "../../../common/workspace-store";
import { clusterStore } from "../../../common/cluster-store";

interface Props {
}

export class Clusters extends React.Component {
  static async init(){
    // todo: move to App.init()
    await Promise.all([
      userStore.load(),
      workspaceStore.load(),
      clusterStore.load(),
    ]);
  }

  render() {
    return (
      <div className="Clusters">
        Clusters page
      </div>
    );
  }
}
