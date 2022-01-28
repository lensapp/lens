/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { DeploymentScaleDialog } from "./scale-dialog";
import type { Deployment, DeploymentApi } from "../../../common/k8s-api/endpoints/deployment.api";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import deploymentApiInjectable from "../../../common/k8s-api/endpoints/deployment.api.injectable";
import { DiRender, renderFor } from "../test-utils/renderFor";
import deploymentScaleDialogStateInjectable from "./scale-dialog.state.injectable";

const dummyDeployment: Deployment = {
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
    selector: { matchLabels: { dummy: "label" }},
    template: {
      metadata: {
        labels: { dummy: "label" },
      },
      spec: {
        containers: [{
          name: "dummy",
          image: "dummy",
          resources: {
            requests: {
              cpu: "1",
              memory: "10Mi",
            },
          },
          terminationMessagePath: "dummy",
          terminationMessagePolicy: "dummy",
          imagePullPolicy: "dummy",
        }],
        restartPolicy: "dummy",
        terminationGracePeriodSeconds: 10,
        dnsPolicy: "dummy",
        serviceAccountName: "dummy",
        serviceAccount: "dummy",
        securityContext: {},
        schedulerName: "dummy",
      },
    },
    strategy: {
      type: "dummy",
      rollingUpdate: {
        maxUnavailable: 1,
        maxSurge: 10,
      },
    },
  },
  status: {
    observedGeneration: 1,
    replicas: 1,
    updatedReplicas: 1,
    readyReplicas: 1,
    conditions: [{
      type: "dummy",
      status: "dummy",
      lastUpdateTime: "dummy",
      lastTransitionTime: "dummy",
      reason: "dummy",
      message: "dummy",
    }],
  },
  getConditions: jest.fn(),
  getConditionsText: jest.fn(),
  getReplicas: jest.fn(),
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

describe("<DeploymentScaleDialog />", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(deploymentScaleDialogStateInjectable, () => ({
      deployment: dummyDeployment,
    }));
  });

  it("renders w/o errors", () => {
    di.override(deploymentApiInjectable, () => ({
      getReplicas: jest.fn().mockImplementationOnce(() => 1),
    }) as any as DeploymentApi);

    const result = render(<DeploymentScaleDialog />);

    expect(result.container).toBeInstanceOf(HTMLElement);
  });

  it("inits with a dummy deployment with mocked current/desired scale", async () => {
    const initReplicas = 3;

    di.override(deploymentApiInjectable, () => ({
      getReplicas: jest.fn().mockImplementationOnce(() => initReplicas),
    }) as any as DeploymentApi);

    const result = render(<DeploymentScaleDialog />);

    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
  });

  it("changes the desired scale when clicking the icon buttons +/-", async () => {
    const initReplicas = 1;

    di.override(deploymentApiInjectable, () => ({
      getReplicas: jest.fn().mockImplementationOnce(() => initReplicas),
    }) as any as DeploymentApi);

    const result = render(<DeploymentScaleDialog />);

    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(result.baseElement.querySelector("input").value).toBe(`${initReplicas}`);

    const up = await result.findByTestId("desired-replicas-up");
    const down = await result.findByTestId("desired-replicas-down");

    fireEvent.click(up);
    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas + 1}`);
    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(result.baseElement.querySelector("input").value).toBe(`${initReplicas + 1}`);

    fireEvent.click(down);
    expect(await result.findByTestId("desired-scale")).toHaveTextContent(`${initReplicas}`);
    expect(await result.findByTestId("current-scale")).toHaveTextContent(`${initReplicas}`);
    expect(result.baseElement.querySelector("input").value).toBe(`${initReplicas}`);

    // edge case, desiredScale must = 0
    let times = 10;

    for (let i = 0; i < times; i++) {
      fireEvent.click(down);
    }
    expect(await result.findByTestId("desired-scale")).toHaveTextContent("0");
    expect(result.baseElement.querySelector("input").value).toBe("0");

    // edge case, desiredScale must = 100 scaleMax (100)
    times = 120;

    for (let i = 0; i < times; i++) {
      fireEvent.click(up);
    }
    expect(await result.findByTestId("desired-scale")).toHaveTextContent("100");
    expect(result.baseElement.querySelector("input").value).toBe("100");
    expect(await result.findByTestId("warning"))
      .toHaveTextContent("High number of replicas may cause cluster performance issues");
  });
});
