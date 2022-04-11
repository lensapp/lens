/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom/extend-expect";

import { ReplicaSetScaleDialog } from "./dialog";
import { waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import type { ReplicaSetApi } from "../../../../common/k8s-api/endpoints/replica-set.api";
import { ReplicaSet } from "../../../../common/k8s-api/endpoints/replica-set.api";
import type { OpenReplicaSetScaleDialog } from "./open.injectable";
import replicaSetApiInjectable from "../../../../common/k8s-api/endpoints/replica-set.api.injectable";
import createStoresAndApisInjectable from "../../../create-stores-apis.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import openReplicaSetScaleDialogInjectable from "./open.injectable";

const dummyReplicaSet = new ReplicaSet({
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "dummy",
    name: "dummy",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/dummy",
  },
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
      status: "True",
      lastTransitionTime: "dummy",
      reason: "dummy",
      message: "dummy",
    }],
  },
});

describe("<ReplicaSetScaleDialog />", () => {
  let replicaSetApi: ReplicaSetApi;
  let openReplicaSetScaleDialog: OpenReplicaSetScaleDialog;
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createStoresAndApisInjectable, () => true);

    render = renderFor(di);
    replicaSetApi = di.inject(replicaSetApiInjectable);
    openReplicaSetScaleDialog = di.inject(openReplicaSetScaleDialogInjectable);
  });

  it("renders w/o errors", () => {
    const { container } = render(<ReplicaSetScaleDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("init with a dummy replica set and mocked current/desired scale", async () => {
    // mock replicaSetApi.getReplicas() which will be called
    // when <ReplicaSetScaleDialog /> rendered.
    const initReplicas = 1;

    replicaSetApi.getReplicas = jest.fn().mockImplementationOnce(async () => initReplicas);
    const { getByTestId } = render(<ReplicaSetScaleDialog />);

    openReplicaSetScaleDialog(dummyReplicaSet);
    // we need to wait for the replicaSetScaleDialog to show up
    // because there is an <Animate /> in <Dialog /> which renders null at start.
    await waitFor(async () => {
      const [currentScale, desiredScale] = await Promise.all([
        getByTestId("current-scale"),
        getByTestId("desired-scale"),
      ]);

      expect(currentScale).toHaveTextContent(`${initReplicas}`);
      expect(desiredScale).toHaveTextContent(`${initReplicas}`);
    });
  });

  it("changes the desired scale when clicking the icon buttons +/-", async () => {
    const initReplicas = 1;

    replicaSetApi.getReplicas = jest.fn().mockImplementationOnce(async () => initReplicas);
    const component = render(<ReplicaSetScaleDialog />);

    openReplicaSetScaleDialog(dummyReplicaSet);
    await waitFor(async () => {
      expect(await component.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
      expect(await component.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
      expect((component.baseElement.querySelector("input")?.value)).toBe(`${initReplicas}`);
    });

    const up = await component.findByTestId("desired-replicas-up");
    const down = await component.findByTestId("desired-replicas-down");

    fireEvent.click(up);
    expect(await component.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas + 1}`);
    expect(await component.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect((component.baseElement.querySelector("input")?.value)).toBe(`${initReplicas + 1}`);

    fireEvent.click(down);
    expect(await component.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await component.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect((component.baseElement.querySelector("input")?.value)).toBe(`${initReplicas}`);

    // edge case, desiredScale must >= 0
    let times = 10;

    for (let i = 0; i < times; i++) {
      fireEvent.click(down);
    }
    expect(await component.findByTestId("desired-scale")).toHaveTextContent("0");
    expect((component.baseElement.querySelector("input")?.value)).toBe("0");

    // edge case, desiredScale must <= scaleMax (100)
    times = 120;

    for (let i = 0; i < times; i++) {
      fireEvent.click(up);
    }
    expect(await component.findByTestId("desired-scale")).toHaveTextContent("100");
    expect((component.baseElement.querySelector("input")?.value)).toBe("100");
    expect(await component.findByTestId("warning"))
      .toHaveTextContent("High number of replicas may cause cluster performance issues");
  });
});
