/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { fireEvent } from "@testing-library/react";
import React from "react";
import { Namespace } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import hierarchicalNamespacesInjectable from "./hierarchical-namespaces.injectable";
import { NamespaceTreeView } from "./namespace-tree-view";
import type { NamespaceTree } from "./store";

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
      uid: `${name}`,
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
    di = getDiForUnitTesting();

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
    ]);

    render = renderFor(di);
  });

  it("renders one namespace without children", () => {
    const tree: NamespaceTree = {
      id: "single-root",
      namespace: singleRoot,
    };

    const result = render(<NamespaceTreeView tree={tree} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders namespace with 2 children namespaces", () => {
    const tree: NamespaceTree = {
      id: "acme-org",
      namespace: acmeGroup,
      children: [
        {
          id: "team-a",
          namespace: teamA,
        },
        {
          id: "team-b",
          namespace: teamB,
        },
      ],
    };

    const result = render(<NamespaceTreeView tree={tree} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders namespace with children namespaces and a subnamespace", () => {
    const tree: NamespaceTree = {
      id: "org-a",
      namespace: orgA,
      children: [
        {
          id: "team-c",
          namespace: teamC,
        },
        {
          id: "service-1",
          namespace: service1,
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders an indicator badge for the subnamespace", () => {
    const tree: NamespaceTree = {
      id: "org-a",
      namespace: orgA,
      children: [
        {
          id: "team-c",
          namespace: teamC,
        },
        {
          id: "service-1",
          namespace: service1,
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);

    expect(result.getByTestId("namespace-details-badge-for-service-1")).toBeInTheDocument();
  });

  it("does not render an indicator badge for the true namespace", () => {
    const tree: NamespaceTree = {
      id: "org-a",
      namespace: orgA,
      children: [
        {
          id: "team-c",
          namespace: teamC,
        },
        {
          id: "service-1",
          namespace: service1,
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);
    const trueNamespace = result.getByTestId("namespace-team-c");

    expect(trueNamespace.querySelector("[data-testid='namespace-details-badge-for-team-c']")).toBeNull();
  });

  it("renders 2 levels deep", () => {
    const tree: NamespaceTree = {
      id: "levels-deep",
      namespace: levelsDeep,
      children: [
        {
          id: "level-deep-child-a",
          namespace: levelDeepChildA,
        },
        {
          id: "level-deep-child-b",
          namespace: levelDeepChildB,
          children: [{
            id: "level-deep-subchild-a",
            namespace: levelDeepSubChildA,
          }],
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);

    expect(result.baseElement).toMatchSnapshot();
  });

  it("expands children items by default", () => {
    const tree: NamespaceTree = {
      id: "levels-deep",
      namespace: levelsDeep,
      children: [
        {
          id: "level-deep-child-a",
          namespace: levelDeepChildA,
        },
        {
          id: "level-deep-child-b",
          namespace: levelDeepChildB,
          children: [{
            id: "level-deep-subchild-a",
            namespace: levelDeepSubChildA,
          }],
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);
    const deepest = result.getByTestId("namespace-level-deep-child-b");

    expect(deepest).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses item by clicking minus button", () => {
    const tree: NamespaceTree = {
      id: "levels-deep",
      namespace: levelsDeep,
      children: [
        {
          id: "level-deep-child-a",
          namespace: levelDeepChildA,
        },
        {
          id: "level-deep-child-b",
          namespace: levelDeepChildB,
          children: [{
            id: "level-deep-subchild-a",
            namespace: levelDeepSubChildA,
          }],
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);
    const levelB = result.getByTestId("namespace-level-deep-child-b");
    const minusButton = levelB.querySelector("[data-testid='minus-square']");

    if (minusButton) {
      fireEvent.click(minusButton);
    }

    expect(result.baseElement).toMatchSnapshot();
  });

  it("expands item by clicking plus button", () => {
    const tree: NamespaceTree = {
      id: "levels-deep",
      namespace: levelsDeep,
      children: [
        {
          id: "level-deep-child-a",
          namespace: levelDeepChildA,
        },
        {
          id: "level-deep-child-b",
          namespace: levelDeepChildB,
          children: [{
            id: "level-deep-subchild-a",
            namespace: levelDeepSubChildA,
          }],
        },
      ],
    };
    const result = render(<NamespaceTreeView tree={tree} />);
    const levelB = result.getByTestId("namespace-level-deep-child-b");
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
