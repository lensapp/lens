/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { fireEvent } from "@testing-library/react";
import React from "react";
import { Namespace } from "../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import hierarchicalNamespacesInjectable from "./hierarchical-namespaces.injectable";
import { NamespaceTreeView } from "./namespace-tree-view";

jest.mock("react-router-dom", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

function createNamespace(name: string, labels?: Record<string, string>, annotations?: Record<string, string>): Namespace {
  return new Namespace({
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name,
      resourceVersion: "1",
      selfLink: `/api/v1/namespaces/${name}`,
      uid: `${name}-1`,
      labels: {
        ...labels,
      },
      annotations: {
        ...annotations,
      },
    },
  });
}

const singleRoot = createNamespace("single-root", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const acmeGroup = createNamespace("acme-org", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const orgA = createNamespace("org-a", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const teamA = createNamespace("team-a", {
  "hnc.x-k8s.io/included-namespace": "true",
  "acme-org.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-a",
  "team-a.tree.hnc.x-k8s.io/depth": "0",
});

const teamB = createNamespace("team-b", {
  "hnc.x-k8s.io/included-namespace": "true",
  "acme-org.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-b",
  "team-b.tree.hnc.x-k8s.io/depth": "0",
});

const teamC = createNamespace("team-c", {
  "hnc.x-k8s.io/included-namespace": "true",
  "org-a.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-c",
  "team-c.tree.hnc.x-k8s.io/depth": "0",
});

const service1 = createNamespace("service-1", {
  "hnc.x-k8s.io/included-namespace": "true",
  "org-a.tree.hnc.x-k8s.io/depth": "1",
  "kubernetes.io/metadata.name": "team-c",
  "service-1.tree.hnc.x-k8s.io/depth": "0",
}, {
  "hnc.x-k8s.io/subnamespace-of": "org-a",
});

const levelsDeep = createNamespace("levels-deep", {
  "hnc.x-k8s.io/included-namespace": "true",
});

const levelDeepChildA = createNamespace("level-deep-child-a", {
  "hnc.x-k8s.io/included-namespace": "true",
  "levels-deep.tree.hnc.x-k8s.io/depth": "1",
  "level-deep-child-a.tree.hnc.x-k8s.io/depth": "0",
});

const levelDeepChildB = createNamespace("level-deep-child-b", {
  "hnc.x-k8s.io/included-namespace": "true",
  "levels-deep.tree.hnc.x-k8s.io/depth": "1",
  "level-deep-child-b.tree.hnc.x-k8s.io/depth": "0",
});

const levelDeepSubChildA = createNamespace("level-deep-subchild-a", {
  "hnc.x-k8s.io/included-namespace": "true",
  "levels-deep.tree.hnc.x-k8s.io/depth": "2",
  "level-deep-child-b.tree.hnc.x-k8s.io/depth": "1",
  "level-deep-subchild-a.tree.hnc.x-k8s.io/depth": "0",
});

describe("<NamespaceTreeView />", () => {
  let di: DiContainer;
  let render: DiRender;
  
  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(hierarchicalNamespacesInjectable, () => [
      acmeGroup,
      orgA,
      teamA,
      teamB,
      teamC,
      service1,
      levelsDeep,
      levelDeepChildA,
      levelDeepChildB,
      levelDeepSubChildA,
    ])

    render = renderFor(di);
  });

  it("renders null with regular namespace", () => {
    const result = render(<NamespaceTreeView root={createNamespace("tree-1")} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders one namespace without children", () => {
    const result = render(<NamespaceTreeView root={singleRoot} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders namespace with 2 children namespaces", () => {
    const result = render(<NamespaceTreeView root={acmeGroup} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders namespace with children namespaces and a subnamespace", () => {
    const result = render(<NamespaceTreeView root={orgA} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders an indicator badge for the subnamespace", () => {
    const result = render(<NamespaceTreeView root={orgA} />);

    expect(result.getByTestId("subnamespace-badge-for-service-1-1")).toBeInTheDocument();
  });

  it("does not render an indicator badge for the true namespace", () => {
    const result = render(<NamespaceTreeView root={orgA} />);
    const trueNamespace = result.getByTestId("namespace-team-c-1");

    expect(trueNamespace.querySelector("[data-testid='subnamespace-badge-for-team-c-1']")).toBeNull();
  });

  it("renders 2 levels deep", () => {
    const result = render(<NamespaceTreeView root={levelsDeep} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("expands children items by default", () => {
    const result = render(<NamespaceTreeView root={levelsDeep} />);
    const deepest = result.getByTestId("namespace-level-deep-child-b-1");

    expect(deepest).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses item by clicking minus button", () => {
    const result = render(<NamespaceTreeView root={levelsDeep} />);
    const levelB = result.getByTestId("namespace-level-deep-child-b-1");
    const minusButton = levelB.querySelector("[data-testid='minus-square']");

    if (minusButton) {
      fireEvent.click(minusButton);
    }

    expect(result.baseElement).toMatchSnapshot();
  });

  it("expands item by clicking plus button", () => {
    const result = render(<NamespaceTreeView root={levelsDeep} />);
    const levelB = result.getByTestId("namespace-level-deep-child-b-1");
    const minusButton = levelB.querySelector("[data-testid='minus-square']");

    if (minusButton) {
      fireEvent.click(minusButton);
    }

    const plusButton = levelB.querySelector("[data-testid='plus-square']");

    if (plusButton) {
      fireEvent.click(plusButton);
    }

    expect(result.baseElement).toMatchSnapshot();
  });
});
