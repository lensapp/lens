/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import { SidebarCluster } from "../sidebar-cluster";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import hotbarStoreInjectable from "../../../../common/hotbars/store.injectable";
import type { HotbarStore } from "../../../../common/hotbars/store";

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
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(hotbarStoreInjectable, () => ({
      isAddedToActive: () => {},
    }) as unknown as HotbarStore);

    render = renderFor(di);
  });

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

