/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom/extend-expect";

import type { StatefulSetApi } from "../../../../common/k8s-api/endpoints";
import { StatefulSet } from "../../../../common/k8s-api/endpoints";
import { StatefulSetScaleDialog } from "./dialog";
import { waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import type { OpenStatefulSetScaleDialog } from "./open.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import statefulSetApiInjectable from "../../../../common/k8s-api/endpoints/stateful-set.api.injectable";
import createStoresAndApisInjectable from "../../../create-stores-apis.injectable";
import openStatefulSetScaleDialogInjectable from "./open.injectable";
import { type DiRender, renderFor } from "../../test-utils/renderFor";

const dummyStatefulSet = new StatefulSet({
  apiVersion: "v1",
  kind: "dummy",
  metadata: {
    uid: "dummy",
    name: "dummy",
    creationTimestamp: "dummy",
    resourceVersion: "dummy",
    namespace: "default",
    selfLink: "/apis/apps/v1/statefulsets/default/dummy",
  },
  spec: {
    serviceName: "dummy",
    replicas: 1,
    selector: {
      matchLabels: { "label": "label" },
    },
    template: {
      metadata: {
        labels: {
          app: "app",
        },
      },
      spec: {
        containers: [{
          name: "dummy",
          image: "dummy",
          ports: [{
            containerPort: 1234,
            name: "dummy",
          }],
          volumeMounts: [{
            name: "dummy",
            mountPath: "dummy",
          }],
        }],
        tolerations: [{
          key: "dummy",
          operator: "dummy",
          effect: "dummy",
          tolerationSeconds: 1,
        }],
      },
    },
    volumeClaimTemplates: [{
      metadata: {
        name: "dummy",
      },
      spec: {
        accessModes: ["dummy"],
        resources: {
          requests: {
            storage: "dummy",
          },
        },
      },
    }],
  },
  status: {
    observedGeneration: 1,
    replicas: 1,
    currentReplicas: 1,
    readyReplicas: 1,
    currentRevision: "dummy",
    updateRevision: "dummy",
    collisionCount: 1,
  },
});

describe("<StatefulSetScaleDialog />", () => {
  let statefulSetApi: StatefulSetApi;
  let openStatefulSetDialog: OpenStatefulSetScaleDialog;
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(createStoresAndApisInjectable, () => true);

    render = renderFor(di);
    statefulSetApi = di.inject(statefulSetApiInjectable);
    openStatefulSetDialog = di.inject(openStatefulSetScaleDialogInjectable);
  });

  it("renders w/o errors", () => {
    const { container } = render(<StatefulSetScaleDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("init with a dummy stateful set and mocked current/desired scale", async () => {
    // mock statefulSetApi.getReplicas() which will be called
    // when <StatefulSetScaleDialog /> rendered.
    const initReplicas = 1;

    statefulSetApi.getReplicas = jest.fn().mockImplementationOnce(async () => initReplicas);
    const { getByTestId } = render(<StatefulSetScaleDialog />);

    openStatefulSetDialog(dummyStatefulSet);
    // we need to wait for the StatefulSetScaleDialog to show up
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

    statefulSetApi.getReplicas = jest.fn().mockImplementationOnce(async () => initReplicas);
    const component = render(<StatefulSetScaleDialog />);

    openStatefulSetDialog(dummyStatefulSet);
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
