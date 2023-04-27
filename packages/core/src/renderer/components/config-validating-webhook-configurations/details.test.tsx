/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import React from "react";
import type { ValidatingWebhookConfigurationData } from "@k8slens/kube-object";
import { ValidatingWebhookConfiguration } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { ValidatingWebhookDetails } from "./validating-webhook-configurations-details";

const validatingWebhookConfig: ValidatingWebhookConfigurationData = {
  apiVersion: "admissionregistration.k8s.io/v1",
  kind: "ValidatingWebhookConfiguration",
  metadata: {
    name: "pod-policy.example.com",
    resourceVersion: "1",
    uid: "pod-policy.example.com",
    namespace: "default",
    selfLink: "/apis/admissionregistration.k8s.io/v1/pod-policy.example.com",
  },
  webhooks: [
    {
      name: "pod-policy.example.com",
      rules: [
        {
          apiGroups: ["", "apps", "extensions"],
          apiVersions: ["v1", "v1beta1"],
          operations: ["CREATE", "UPDATE"],
          resources: ["pods", "deployments"],
        },
      ],
      failurePolicy: "Fail",
      admissionReviewVersions: ["v1", "v1beta1"],
      sideEffects: "None",
      timeoutSeconds: 5,
      clientConfig: {
        service: {
          namespace: "service-namespace",
          name: "service-name",
        },
        caBundle: "Cg==",
      },
    },
  ],
};

describe("ValidatingWebhookConfigsDetails", () => {
  let result: RenderResult;
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
  });

  it("renders", () => {
    const webhookConfig = new ValidatingWebhookConfiguration(validatingWebhookConfig);

    result = render(
      <ValidatingWebhookDetails object={webhookConfig} />,
    );

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders with no webhooks", () => {
    const webhookConfig = new ValidatingWebhookConfiguration({
      ...validatingWebhookConfig,
      webhooks: [],
    });

    result = render(
      <ValidatingWebhookDetails object={webhookConfig} />,
    );

    expect(result.baseElement).toMatchSnapshot();
  });
});
