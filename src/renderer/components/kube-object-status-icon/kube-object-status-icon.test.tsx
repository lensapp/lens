/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { computed } from "mobx";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { KubeObjectStatusLevel } from "../../../extensions/renderer-api/kube-object-status";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { KubeObjectStatusIcon } from "./kube-object-status-icon";
import React from "react";
import type { KubeObjectStatusRegistration } from "./kube-object-status-registration";

describe("kube-object-status-icon", () => {
  let render: DiRender;
  let kubeObjectStatusRegistrations: KubeObjectStatusRegistration[];

  beforeEach(async () => {
    // TODO: Make mocking of date in unit tests global
    global.Date.now = () => new Date("2015-10-21T07:28:00Z").getTime();

    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    render = renderFor(di);

    kubeObjectStatusRegistrations = [];

    const someTestExtension = new SomeTestExtension(
      kubeObjectStatusRegistrations,
    );

    di.override(rendererExtensionsInjectable, () =>
      computed(() => [someTestExtension]),
    );

    await di.runSetups();
  });

  it("given no statuses, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("irrelevant", "irrelevant");

    const { container } = render(<KubeObjectStatusIcon object={kubeObject} />);

    expect(container).toMatchSnapshot();
  });

  it('given level "critical" status, when rendered, renders with status', () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusRegistration = getStatusRegistration(
      KubeObjectStatusLevel.CRITICAL,
      "critical",
      "some-kind",
      ["some-api-version"],
    );

    kubeObjectStatusRegistrations.push(statusRegistration);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('given level "info" status, when rendered, renders with status', () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusRegistration = getStatusRegistration(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
    );

    kubeObjectStatusRegistrations.push(statusRegistration);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('given level "warning" status, when rendered, renders with status', () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusRegistration = getStatusRegistration(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
    );

    kubeObjectStatusRegistrations.push(statusRegistration);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given status for all levels is present, when rendered, renders with statuses", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const critical = getStatusRegistration(
      KubeObjectStatusLevel.CRITICAL,
      "critical",
      "some-kind",
      ["some-api-version"],
    );

    const warning = getStatusRegistration(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
    );

    const info = getStatusRegistration(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
    );

    kubeObjectStatusRegistrations.push(critical);
    kubeObjectStatusRegistrations.push(warning);
    kubeObjectStatusRegistrations.push(info);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given info and warning statuses are present, when rendered, renders with statuses", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const warning = getStatusRegistration(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
    );

    const info = getStatusRegistration(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
    );

    kubeObjectStatusRegistrations.push(warning);
    kubeObjectStatusRegistrations.push(info);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });


  it("given registration for wrong api version, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusRegistration = getStatusRegistration(
      KubeObjectStatusLevel.CRITICAL,
      "irrelevant",
      "some-kind",
      ["some-other-api-version"],
    );

    kubeObjectStatusRegistrations.push(statusRegistration);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given registration for wrong kind, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusRegistration = getStatusRegistration(
      KubeObjectStatusLevel.CRITICAL,
      "irrelevant",
      "some-other-kind",
      ["some-api-version"],
    );

    kubeObjectStatusRegistrations.push(statusRegistration);

    const { baseElement } = render(
      <KubeObjectStatusIcon object={kubeObject} />,
    );

    expect(baseElement).toMatchSnapshot();
  });

  it("given registration without status for exact kube object, when rendered, renders as empty", () => {
    const kubeObject = getKubeObjectStub("some-kind", "some-api-version");

    const statusRegistration = {
      apiVersions: ["some-api-version"],
      kind: "some-kind",
      resolve: (): void => {},
    };

    // @ts-ignore
    kubeObjectStatusRegistrations.push(statusRegistration);

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

const getStatusRegistration = (level: KubeObjectStatusLevel, title: string, kind: string, apiVersions: string[]) => ({
  apiVersions,
  kind,
  resolve: (kubeObject: KubeObject) => ({
    level,
    text: `Some ${title} status for ${kubeObject.getName()}`,
    timestamp: "2015-10-19T07:28:00Z",
  }),
});

class SomeTestExtension extends LensRendererExtension {
  constructor(kubeObjectStatusTexts: KubeObjectStatusRegistration[]) {
    super({
      id: "some-id",
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: "some-id", version: "some-version" },
      manifestPath: "irrelevant",
    });

    this.kubeObjectStatusTexts = kubeObjectStatusTexts;
  }
}
