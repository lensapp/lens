import "./landing-page.scss";
import React from "react";
import { computed, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { WorkspaceId, workspaceStore } from "../../../common/workspace-store";
import { WorkspaceOverview } from "./workspace-overview";
import { PageLayout } from "../layout/page-layout";
import { Notifications } from "../notifications";
import { Icon } from "../icon";
import { createStorage } from "../../utils";

@observer
export class LandingPage extends React.Component {
  private static storage = createStorage<WorkspaceId[]>("seen_workspaces", []);

  @computed get workspace() {
    return workspaceStore.currentWorkspace;
  }

  componentDidMount() {
    // ignore workspaces that don't exist
    const seenWorkspaces = new Set(
      LandingPage
        .storage
        .get()
        .filter(id => workspaceStore.getById(id))
    );

    disposeOnUnmount(this, [
      reaction(() => this.workspace, workspace => {
        const showWelcomeNotification = !(
          seenWorkspaces.has(workspace.id)
          || workspace.isManaged
          || clusterStore.getByWorkspaceId(workspace.id).length
        );

        if (showWelcomeNotification) {
          Notifications.info(<><b>Welcome!</b><p>Get started by associating one or more clusters to Lens</p></>, {
            timeout: 30_000,
            id: "landing-welcome"
          });
        }

        seenWorkspaces.add(workspace.id);
        LandingPage.storage.set(Array.from(seenWorkspaces));
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  render() {
    const showBackButton = Boolean(this.workspace.activeClusterId);
    const header = <><Icon svg="logo-lens" big /> <h2>{this.workspace.name}</h2></>;

    return (
      <PageLayout className="LandingOverview flex" header={header} provideBackButtonNavigation={showBackButton} showOnTop={true}>
        <WorkspaceOverview />
      </PageLayout>
    );
  }
}
