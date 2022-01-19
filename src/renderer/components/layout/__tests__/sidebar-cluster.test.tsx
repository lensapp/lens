/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import { SidebarCluster } from "../sidebar-cluster";
import { KubernetesCluster } from "../../../../common/catalog-entities";

jest.mock("../../../../common/hotbar-store", () => ({
  HotbarStore: {
    getInstance: () => ({
      isAddedToActive: jest.fn(),
    }),
  },
}));

const clusterEntity = new KubernetesCluster({
  metadata: {
    uid: "test-uid",
    name: "test-cluster",
    source: "local",
    labels: {},
  },
  spec: {
    kubeconfigPath: "",
    kubeconfigContext: "",
  },
  status: {
    phase: "connected",
  },
});

describe("<SidebarCluster/>", () => {
  it("renders w/o errors", () => {
    const { container } = render(<SidebarCluster clusterEntity={clusterEntity}/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders cluster avatar and name", () => {
    const { getByText, getAllByText } = render(<SidebarCluster clusterEntity={clusterEntity}/>);

    expect(getByText("tc")).toBeInTheDocument();

    const v = getAllByText("test-cluster");

    expect(v.length).toBeGreaterThan(0);

    for (const e of v) {
      expect(e).toBeInTheDocument();
    }
  });

  it("renders cluster menu", () => {
    const { getByTestId, getByText } = render(<SidebarCluster clusterEntity={clusterEntity}/>);
    const link = getByTestId("sidebar-cluster-dropdown");

    fireEvent.click(link);
    expect(getByText("Add to Hotbar")).toBeInTheDocument();
  });
});

