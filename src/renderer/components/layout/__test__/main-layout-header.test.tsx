jest.mock("../../../../common/ipc");

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { MainLayoutHeader } from "../main-layout-header";
import { Cluster } from "../../../../main/cluster";
import { workspaceStore } from "../../../../common/workspace-store";
import { broadcastMessage } from "../../../../common/ipc";

const mockBroadcastIpc = broadcastMessage as jest.MockedFunction<typeof broadcastMessage>;

const cluster: Cluster = new Cluster({
  id: "foo",
  contextName: "minikube",
  kubeConfigPath: "minikube-config.yml",
  workspace: workspaceStore.currentWorkspaceId
});

describe("<MainLayoutHeader />", () => {
  it("renders w/o errors", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders gear icon", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);
    const icon = container.querySelector(".Icon .icon");

    expect(icon).toBeInstanceOf(HTMLElement);
    expect(icon).toHaveTextContent("settings");
  });

  it("navigates to cluster settings", () => {
    const { container } = render(<MainLayoutHeader cluster={cluster} />);
    const icon = container.querySelector(".Icon");

    fireEvent.click(icon);
    expect(mockBroadcastIpc).toBeCalledWith("renderer:navigate", "/cluster/foo/settings");
  });

  it("renders cluster name", () => {
    const { getByText } = render(<MainLayoutHeader cluster={cluster} />);

    expect(getByText("minikube")).toBeInTheDocument();
  });
});