/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { findByTestId, findByText } from "@testing-library/react";
import { NetworkPolicy } from "../../../../common/k8s-api/endpoints";
import { NetworkPolicyDetails } from "../details";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import lookupApiLinkInjectable from "../../../../common/k8s-api/lookup-api-link.injectable";
import localeTimezoneInjectable from "../../locale-date/locale-timezone.injectable";
import getStatusItemsForKubeObjectInjectable from "../../kube-object-status-icon/status-items-for-object.injectable";
import { computed } from "mobx";

describe("NetworkPolicyDetails", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);
    di.override(lookupApiLinkInjectable, () => () => "");
    di.override(localeTimezoneInjectable, () => computed(() => "Europe/Helsinki"));
    di.override(getStatusItemsForKubeObjectInjectable, () => () => []);
  });

  it("should render w/o errors", () => {
    const policy = new NetworkPolicy({
      kind: NetworkPolicy.kind,
      apiVersion: "networking.k8s.io/v1",
      metadata: {
        name: "foobar",
        resourceVersion: "1",
        creationTimestamp: "",
        selfLink: "",
        uid: "2",
      },
      spec: {
        podSelector: {},
      },
    });
    const { container } = render(<NetworkPolicyDetails object={policy} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("should render egress nodeSelector", async () => {
    const policy = new NetworkPolicy({
      kind: NetworkPolicy.kind,
      apiVersion: "networking.k8s.io/v1",
      metadata: {
        creationTimestamp: "",
        name: "foobar",
        resourceVersion: "1",
        selfLink: "",
        uid: "2",
      },
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
    });
    const { container } = render(<NetworkPolicyDetails object={policy} />);

    expect(await findByTestId(container, "egress-0")).toBeInstanceOf(HTMLElement);
    expect(await findByText(container, "foo: bar")).toBeInstanceOf(HTMLElement);
  });

  it("should not crash if egress nodeSelector doesn't have matchLabels", () => {
    const policy = new NetworkPolicy({
      kind: NetworkPolicy.kind,
      apiVersion: "networking.k8s.io/v1",
      metadata: {
        creationTimestamp: "",
        name: "foobar",
        resourceVersion: "1",
        selfLink: "",
        uid: "2",
      },
      spec: {
        egress: [{
          to: [{
            namespaceSelector: {},
          }],
        }],
        podSelector: {},
      },
    });
    const { container } = render(<NetworkPolicyDetails object={policy} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });
});
