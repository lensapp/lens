/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "@testing-library/jest-dom/extend-expect";

import { ReplicaSetScaleDialog } from "./replicaset-scale-dialog";
import { render, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints/replica-set.api";

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
  let replicaSetApi: ReplicaSetApi;

  beforeEach(() => {
    replicaSetApi = new ReplicaSetApi({
      objectConstructor: ReplicaSet,
    });
  });

  it("renders w/o errors", () => {
    const { container } = render(<ReplicaSetScaleDialog replicaSetApi={replicaSetApi} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("init with a dummy replica set and mocked current/desired scale", async () => {
    // mock replicaSetApi.getReplicas() which will be called
    // when <ReplicaSetScaleDialog /> rendered.
    const initReplicas = 1;

    replicaSetApi.getReplicas = jest.fn().mockImplementationOnce(async () => initReplicas);
    const { getByTestId } = render(<ReplicaSetScaleDialog replicaSetApi={replicaSetApi} />);

    ReplicaSetScaleDialog.open(dummyReplicaSet);
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
    const component = render(<ReplicaSetScaleDialog replicaSetApi={replicaSetApi} />);

    ReplicaSetScaleDialog.open(dummyReplicaSet);
    await waitFor(async () => {
      expect(await component.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
      expect(await component.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
      expect((await component.baseElement.querySelector("input").value)).toBe(`${initReplicas}`);
    });

    const up = await component.findByTestId("desired-replicas-up");
    const down = await component.findByTestId("desired-replicas-down");

    fireEvent.click(up);
    expect(await component.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas + 1}`);
    expect(await component.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect((await component.baseElement.querySelector("input").value)).toBe(`${initReplicas + 1}`);

    fireEvent.click(down);
    expect(await component.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await component.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect((await component.baseElement.querySelector("input").value)).toBe(`${initReplicas}`);

    // edge case, desiredScale must >= 0
    let times = 10;

    for (let i = 0; i < times; i++) {
      fireEvent.click(down);
    }
    expect(await component.findByTestId("desired-scale")).toHaveTextContent("0");
    expect((await component.baseElement.querySelector("input").value)).toBe("0");

    // edge case, desiredScale must <= scaleMax (100)
    times = 120;

    for (let i = 0; i < times; i++) {
      fireEvent.click(up);
    }
    expect(await component.findByTestId("desired-scale")).toHaveTextContent("100");
    expect((component.baseElement.querySelector("input").value)).toBe("100");
    expect(await component.findByTestId("warning"))
      .toHaveTextContent("High number of replicas may cause cluster performance issues");
  });
});
