import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import { DeploymentScaleDialog } from "./deployment-scale-dialog";
jest.mock("../../api/endpoints");
import { deploymentApi } from "../../api/endpoints";

const dummyDeployment = {
  apiVersion: 'v1',
  kind: 'dummy',
  metadata: {
    uid: 'dummy',
    name: 'dummy',
    creationTimestamp: 'dummy',
    resourceVersion: 'dummy',
    selfLink: 'link',
  },
  selfLink: 'link',
  spec: {
    replicas: 1,
    selector: { matchLabels: { dummy: 'label' } },
    template: {
      metadata: {
        labels: { dummy: 'label' },
      },
      spec: {
        containers: [{
          name: 'dummy',
          image: 'dummy',
          resources: {
            requests: {
              cpu: '1',
              memory: '10Mi',
            },
          },
          terminationMessagePath: 'dummy',
          terminationMessagePolicy: 'dummy',
          imagePullPolicy: 'dummy',
        }],
        restartPolicy: 'dummy',
        terminationGracePeriodSeconds: 10,
        dnsPolicy: 'dummy',
        serviceAccountName: 'dummy',
        serviceAccount: 'dummy',
        securityContext: {},
        schedulerName: 'dummy',
      },
    },
    strategy: {
      type: 'dummy',
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
      type: 'dummy',
      status: 'dummy',
      lastUpdateTime: 'dummy',
      lastTransitionTime: 'dummy',
      reason: 'dummy',
      message: 'dummy',
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
  getFinalizers: jest.fn(),
  getLabels: jest.fn(),
  getAnnotations: jest.fn(),
  getOwnerRefs: jest.fn(),
  getSearchFields: jest.fn(),
  toPlainObject: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('<DeploymentScaleDialog />', () => {

  it('renders w/o errors', () => {
    const { container } = render(<DeploymentScaleDialog />);
    expect(container).toBeInstanceOf(HTMLElement);
  });

  it('inits with a dummy deployment with mocked current/desired scale', async () => {
    // mock deploymentApi.getReplicas() which will be called 
    // when <DeploymentScaleDialog /> rendered.
    const initReplicas = 3
    deploymentApi.getReplicas = jest.fn().mockImplementationOnce(async () => initReplicas);
    const { getByTestId } = render(<DeploymentScaleDialog />);
    DeploymentScaleDialog.open(dummyDeployment);
    let currentScale, desiredScale
    // we need to wait for the DeploymentScaleDialog to show up
    // because there is an <Animate /> in <Dialog /> which renders null at start.
    await waitFor(async () => 
      [currentScale, desiredScale] = await Promise.all([
        getByTestId('current-scale'),
        getByTestId('desired-scale'),
      ])
    );
    expect(currentScale).toHaveTextContent(`${initReplicas}`);
    expect(desiredScale).toHaveTextContent(`${initReplicas}`);
  });

});

