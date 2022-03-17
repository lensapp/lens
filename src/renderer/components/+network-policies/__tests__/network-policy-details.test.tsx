/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { findByTestId, findByText, render } from "@testing-library/react";
import { NetworkPolicy } from "../../../../common/k8s-api/endpoints";
import { NetworkPolicyDetails } from "../network-policy-details";

jest.mock("../../kube-object-meta");

describe("NetworkPolicyDetails", () => {
  it("should render w/o errors", () => {
    const policy = new NetworkPolicy({
      metadata: {} as never,
      spec: {} as never,
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
    });
    const { container } = render(<NetworkPolicyDetails object={policy} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("should render egress nodeSelector", async () => {
    const policy = new NetworkPolicy({
      metadata: {} as never,
      spec: {
        egress: [{
          to: [{
            namespaceSelector: {
              matchLabels: {
                foo: "bar",
              },
            },
          }],
        }],
        podSelector: {},
      },
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
    });
    const { container } = render(<NetworkPolicyDetails object={policy} />);

    expect(await findByTestId(container, "egress-0")).toBeInstanceOf(HTMLElement);
    expect(await findByText(container, "foo: bar")).toBeInstanceOf(HTMLElement);
  });

  it("should not crash if egress nodeSelector doesn't have matchLabels", async () => {
    const policy = new NetworkPolicy({
      metadata: {} as never,
      spec: {
        egress: [{
          to: [{
            namespaceSelector: {},
          }],
        }],
        podSelector: {},
      },
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
    });
    const { container } = render(<NetworkPolicyDetails object={policy} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });
});
