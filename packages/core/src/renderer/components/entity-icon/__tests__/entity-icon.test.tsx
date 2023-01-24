/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { KubernetesCluster } from "../../../../common/catalog-entities";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import { EntityIcon } from "../entity-icon";

describe("<EntityIcon />", () => {
  let render: DiRender;

  beforeEach(() => {
    render = renderFor(getDiForUnitTesting({ doGeneralOverrides: true }));
  });

  it("should render w/o errors when given undefined", () => {
    expect(render(<EntityIcon />).container).toBeInstanceOf(HTMLElement);
  });

  it("should render w/o errors", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).container).toBeInstanceOf(HTMLElement);
  });

  it("should render icon if KubernetesCluster has one in spec", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
        icon: {
          material: "cog",
        },
      },
      status: {
        phase: "disconnected",
      },
    });



    expect(render(<EntityIcon entity={kc} />).container.querySelector(".Icon")).toBeInstanceOf(HTMLElement);
  });

  it("should render img if KubernetesCluster has one in spec", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
        icon: {
          src: "data:,Hello%2C%20World%21",
        },
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).container.querySelector("img")).toBeInstanceOf(HTMLElement);
  });

  it("should render short name", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).getByText("fo")).toBeInstanceOf(HTMLElement);
  });

  it("should render specified short name", () => {
    const kc = new KubernetesCluster({
      metadata: {
        labels: {},
        name: "foobar",
        uid: "foobar",
        shortName: "high",
      },
      spec: {
        kubeconfigContext: "default",
        kubeconfigPath: "",
      },
      status: {
        phase: "disconnected",
      },
    });

    expect(render(<EntityIcon entity={kc} />).getByText("high")).toBeInstanceOf(HTMLElement);
  });
});
