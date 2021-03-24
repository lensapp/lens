jest.mock("../../../../common/ipc");

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { MainLayoutHeader } from "../main-layout-header";
import { Cluster } from "../../../../main/cluster";
import { workspaceStore } from "../../../../common/workspace-store";
import { broadcastMessage, requestMain } from "../../../../common/ipc";
import { clusterDisconnectHandler } from "../../../../common/cluster-ipc";
import { ConfirmDialog } from "../../confirm-dialog";
import { IpcRendererNavigationEvents } from "../../../navigation/events";

const mockBroadcastIpc = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;
const mockRequestMain = requestMain as jest.MockedFunction<typeof requestMain>;

const cluster: Cluster = new Cluster({
  id: "foo",
  contextName: "minikube",
  kubeConfigPath: "minikube-config.yml",
  workspace: workspaceStore.currentWorkspaceId,
});

describe("<MainLayoutHeader />", () => {
  it("renders w/o errors", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders three dots icon", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);
    const icon = container.querySelector(".Icon .icon");

    expect(icon).toBeInstanceOf(HTMLElement);
    expect(icon).toHaveTextContent("more_vert");
  });

  it("renders cluster name", () => {
    const { getByText } = render(<MainLayoutHeader cluster={cluster} />);

    expect(getByText("minikube")).toBeInTheDocument();
  });

  describe("Cluster Actions Menu", () => {
    let settingsBtn: Element;
    let disconnectBtn: Element;
    let removeBtn: Element;

    beforeEach(() => {
      const { container } = render(<div>
        <MainLayoutHeader cluster={cluster} />
        <ConfirmDialog />
      </div>);
      const icon = container.querySelector(".Icon");

      cluster.online = true;
      fireEvent.click(icon);

      [settingsBtn, disconnectBtn, removeBtn] = Array.from(document.querySelectorAll("ul.ClusterActionsMenu > li"))
        .map(el => el.querySelector("span"));
    });

    afterEach(() => {
      cluster.online = false;
    });

    it("renders cluster menu items", () => {
      expect(settingsBtn).toBeDefined();
      expect(settingsBtn.textContent).toBe("Settings");
      expect(disconnectBtn).toBeDefined();
      expect(disconnectBtn.textContent).toBe("Disconnect");
      expect(removeBtn).toBeDefined();
      expect(removeBtn.textContent).toBe("Remove");
    });

    it("navigates to cluster settings", () => {
      fireEvent.click(settingsBtn);
      expect(mockBroadcastIpc).toBeCalledWith(IpcRendererNavigationEvents.NAVIGATE_IN_APP, "/cluster/foo/settings");
    });

    it("disconnects from cluster", () => {
      fireEvent.click(disconnectBtn);
      expect(mockRequestMain).toBeCalledWith(clusterDisconnectHandler, cluster.id);
    });

    it("opens 'Remove cluster' dialog", async () => {
      fireEvent.click(removeBtn);

      const dialog = document.querySelector(".ConfirmDialog");

      expect(dialog).toBeDefined();
      expect(dialog).not.toBe(null);

      const okBtn = dialog.querySelector("button.ok");

      expect(okBtn.textContent).toBe("Remove");
    });
  });
});
