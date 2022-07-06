/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import type { KubeObjectStatus } from "../../../common/k8s-api/kube-object-status";
import { KubeObjectStatusLevel } from "../../../common/k8s-api/kube-object-status";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { KubeObjectStatusIcon } from "./kube-object-status-icon";
import React from "react";
import { useFakeTime } from "../../../common/test-utils/use-fake-time";
import { getInjectable } from "@ogre-tools/injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import { kubeObjectStatusTextInjectionToken } from "./kube-object-status-text-injection-token";
import { computed } from "mobx";

describe("kube-object-status-icon", () => {
  let render: DiRender;
  let di: DiContainer;

  beforeEach(() => {
    useFakeTime("2015-10-21T07:28:00Z");

    di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);
  });

  it("given no statuses, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("irrelevant", "irrelevant");

    const { container } = render(<KubeObjectStatusIcon object={kubeObject} />);

    expect(container).toMatchSnapshot();
  });

  it('given level "critical" status, when rendered, renders with status', () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.CRITICAL,
      "critical",
      "some-kind",
      ["some-api-version"],
    );

    di.register(statusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('given level "info" status, when rendered, renders with status', () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
    );

    di.register(statusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('given level "warning" status, when rendered, renders with status', () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
    );

    di.register(statusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given status for all levels is present, when rendered, renders with statuses", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const criticalStatusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.CRITICAL,
      "critical",
      "some-kind",
      ["some-api-version"],
    );

    const warningStatusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
    );

    const infoStatusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
    );

    di.register(
      criticalStatusTextInjectable,
      warningStatusTextInjectable,
      infoStatusTextInjectable,
    );

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given info and warning statuses are present, when rendered, renders with statuses", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const warningStatusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
    );

    const infoStatusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
    );

    di.register(warningStatusTextInjectable, infoStatusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });


  it("given registration for wrong api version, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.CRITICAL,
      "irrelevant",
      "some-kind",
      ["some-other-api-version"],
    );

    di.register(statusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given registration for wrong kind, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusTextInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.CRITICAL,
      "irrelevant",
      "some-other-kind",
      ["some-api-version"],
    );

    di.register(statusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given registration without status for exact kube object, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusTextInjectable = getInjectable({
      id: "some-id",
      instantiate: () => ({
        apiVersions: ["some-api-version"],
        kind: "some-kind",
        resolve: () => { return undefined as unknown as KubeObjectStatus; },
        enabled: computed(() => true),
      }),

      injectionToken: kubeObjectStatusTextInjectionToken,
    });

    di.register(statusTextInjectable);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });
});

const getKubeObjectStub = (kind: string, apiVersion: string) => KubeObject.create({
  apiVersion,
  kind,
  metadata: {
    uid: "some-uid",
    name: "some-name",
    resourceVersion: "some-resource-version",
    namespace: "some-namespace",
    selfLink: "/foo",
  },
});

const getStatusTextInjectable = (level: KubeObjectStatusLevel, title: string, kind: string, apiVersions: string[]) => getInjectable({
  id: title,
  instantiate: () => ({
    apiVersions,
    kind,

    resolve: (kubeObject: KubeObject) => ({
      level,
      text: `Some ${title} status for ${kubeObject.getName()}`,
      timestamp: "2015-10-19T07:28:00Z",
    }),

    enabled: computed(() => true),
  }),

  injectionToken: kubeObjectStatusTextInjectionToken,
});
