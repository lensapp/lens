/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom/extend-expect";

import { ReplicaSetScaleDialog } from "./scale-dialog";
import { fireEvent } from "@testing-library/react";
import React from "react";
import type { ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints/replica-set.api";
import replicaSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../test-utils/renderFor";
import replicaSetApiInjectable from "../../../common/k8s-api/endpoints/replica-set.api.injectable";

const dummyReplicaSet: ReplicaSet = {
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "dummy",
    name: "dummy",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    selfLink: "link",
  },
  selfLink: "link",
  spec: {
    replicas: 1,
    selector: {
      matchLabels: { "label": "label" },
    },
    template: {
      metadata: {
        labels: {
          app: "label",
        },
      },
      spec: {
        containers: [{
          name: "dummy",
          image: "dummy",
          imagePullPolicy: "dummy",
        }],
        initContainers: [{
          name: "dummy",
          image: "dummy",
          imagePullPolicy: "dummy",
        }],
        priority: 1,
        serviceAccountName: "dummy",
        serviceAccount: "dummy",
        securityContext: {},
        schedulerName: "dummy",
      },
    },
    minReadySeconds: 1,
  },
  status: {
    replicas: 1,
    fullyLabeledReplicas: 1,
    readyReplicas: 1,
    availableReplicas: 1,
    observedGeneration: 1,
    conditions: [{
      type: "dummy",
      status: "dummy",
      lastUpdateTime: "dummy",
      lastTransitionTime: "dummy",
      reason: "dummy",
      message: "dummy",
    }],
  },
  getDesired: jest.fn(),
  getCurrent: jest.fn(),
  getReady: jest.fn(),
  getImages: jest.fn(),
  getSelectors: jest.fn(),
  getTemplateLabels: jest.fn(),
  getAffinity: jest.fn(),
  getTolerations: jest.fn(),
  getNodeSelectors: jest.fn(),
  getAffinityNumber: jest.fn(),
  getId: jest.fn(),
  getResourceVersion: jest.fn(),
  getName: jest.fn(),
  getNs: jest.fn(),
  getAge: jest.fn(),
  getTimeDiffFromNow: jest.fn(),
  getFinalizers: jest.fn(),
  getLabels: jest.fn(),
  getAnnotations: jest.fn(),
  getOwnerRefs: jest.fn(),
  getSearchFields: jest.fn(),
  toPlainObject: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

describe("<ReplicaSetScaleDialog />", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(replicaSetScaleDialogStateInjectable, () => ({
      replicaSet: dummyReplicaSet,
    }));
  });

  it("renders w/o errors", () => {
    di.override(replicaSetApiInjectable, () => ({
      getReplicas: jest.fn().mockImplementationOnce(() => 1),
    }) as any as ReplicaSetApi);

    const result = render(<ReplicaSetScaleDialog />);

    expect(result.container).toBeInstanceOf(HTMLElement);
  });

  it("init with a dummy replica set and mocked current/desired scale", async () => {
    // mock replicaSetApi.getReplicas() which will be called
    // when <ReplicaSetScaleDialog /> rendered.
    const initReplicas = 1;

    di.override(replicaSetApiInjectable, () => ({
      getReplicas: jest.fn().mockImplementationOnce(() => initReplicas),
    }) as any as ReplicaSetApi);

    const result = render(<ReplicaSetScaleDialog />);

    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
  });

  it("changes the desired scale when clicking the icon buttons +/-", async () => {
    const initReplicas = 1;

    di.override(replicaSetApiInjectable, () => ({
      getReplicas: jest.fn().mockImplementationOnce(() => initReplicas),
    }) as any as ReplicaSetApi);

    const result = render(<ReplicaSetScaleDialog />);

    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(result.baseElement.querySelector("input").value).toBe(`${initReplicas}`);

    const up = await result.findByTestId("desired-replicas-up");
    const down = await result.findByTestId("desired-replicas-down");

    fireEvent.click(up);
    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas + 1}`);
    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect((result.baseElement.querySelector("input").value)).toBe(`${initReplicas + 1}`);

    fireEvent.click(down);
    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(result.baseElement.querySelector("input").value).toBe(`${initReplicas}`);

    // edge case, desiredScale must >= 0
    let times = 10;

    for (let i = 0; i < times; i++) {
      fireEvent.click(down);
    }
    expect(await result.findByTestId("desired-scale")).toHaveTextContent("0");
    expect(result.baseElement.querySelector("input").value).toBe("0");

    // edge case, desiredScale must <= scaleMax (100)
    times = 120;

    for (let i = 0; i < times; i++) {
      fireEvent.click(up);
    }
    expect(await result.findByTestId("desired-scale")).toHaveTextContent("100");
    expect((result.baseElement.querySelector("input").value)).toBe("100");
    expect(await result.findByTestId("warning"))
      .toHaveTextContent("High number of replicas may cause cluster performance issues");
  });
});
