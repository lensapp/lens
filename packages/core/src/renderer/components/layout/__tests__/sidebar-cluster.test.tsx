/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { SidebarCluster } from "../sidebar-cluster";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { renderFor } from "../../test-utils/renderFor";

describe("<SidebarCluster/>", () => {
  let result: RenderResult;

  beforeEach(() => {
    const di = getDiForUnitTesting();
    const render = renderFor(di);

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

    result = render(<SidebarCluster clusterEntity={clusterEntity}/>);
  });

  it("renders w/o errors", () => {
    expect(result.container).toMatchSnapshot();
  });

  it("renders cluster avatar and name", () => {
    expect(result.getByText("tc")).toBeInTheDocument();

    const v = result.getAllByText("test-cluster");

    expect(v.length).toBeGreaterThan(0);

    for (const e of v) {
      expect(e).toBeInTheDocument();
    }
  });

  it("renders cluster menu", () => {
    fireEvent.click(result.getByTestId("sidebar-cluster-dropdown"));
    expect(result.getByText("Add to Hotbar")).toBeInTheDocument();
  });
});

