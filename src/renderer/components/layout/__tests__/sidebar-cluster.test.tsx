/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import { SidebarCluster } from "../sidebar-cluster";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { noop } from "lodash";
import addToActiveHotbarInjectable from "../../../../common/hotbar-store/add-to-active-hotbar.injectable";
import removeByIdFromActiveHotbarInjectable from "../../../../common/hotbar-store/remove-from-active-hotbar.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import isItemInActiveHotbarInjectable from "../../../../common/hotbar-store/is-added-to-active-hotbar.injectable";

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
  let di: ConfigurableDependencyInjectionContainer;

  beforeAll(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(addToActiveHotbarInjectable, () => noop);
    di.override(removeByIdFromActiveHotbarInjectable, () => noop);
    di.override(isItemInActiveHotbarInjectable, () => () => false);
  });

  it("renders w/o errors", () => {
    const { container } = render(<SidebarCluster clusterEntity={clusterEntity}/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders cluster avatar and name", async () => {
    const { findByText, findAllByText } = render(<SidebarCluster clusterEntity={clusterEntity}/>);

    expect(await findByText("tc")).toBeInTheDocument();

    const v = await findAllByText("test-cluster");

    expect(v.length).toBeGreaterThan(0);

    for (const e of v) {
      expect(e).toBeInTheDocument();
    }
  });

  it("renders cluster menu", async () => {
    const { findByTestId, findByText } = render(<SidebarCluster clusterEntity={clusterEntity}/>);

    fireEvent.click(await findByTestId("sidebar-cluster-dropdown"));
    expect(await findByText("Add to Hotbar")).toBeInTheDocument();
  });
});

