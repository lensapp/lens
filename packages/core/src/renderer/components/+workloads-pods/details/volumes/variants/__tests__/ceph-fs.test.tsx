/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { render } from "@testing-library/react";
import React from "react";
import type { CephfsSource } from "../../../../../../../common/k8s-api/endpoints";
import { Pod } from "../../../../../../../common/k8s-api/endpoints";
import { CephFs } from "../ceph-fs";

describe("<CephFs />", () => {
  it("should render 'false' for Readonly when not provided", () => {
    const cephfsName = "my-ceph";
    const cephfsVolume: CephfsSource = {
      monitors: [],
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        uid: "123",
        selfLink: "/api/v1/pod/default/my-pod",
      },
      spec: {
        volumes: [{
          name: cephfsName,
          cephfs: cephfsVolume,
        }],
      },
    });
    const result = render((
      <CephFs
        pod={pod}
        variant={cephfsVolume}
        volumeName={cephfsName}
      />
    ));

    expect(result.container).toMatchSnapshot();
    expect(result.getByTestId("cephfs-readonly")).toHaveTextContent("false");
  });

  it("should render 'false' for Readonly when false is provided", () => {
    const cephfsName = "my-ceph";
    const cephfsVolume: CephfsSource = {
      monitors: [],
      readOnly: false,
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        uid: "123",
        selfLink: "/api/v1/pod/default/my-pod",
      },
      spec: {
        volumes: [{
          name: cephfsName,
          cephfs: cephfsVolume,
        }],
      },
    });
    const result = render((
      <CephFs
        pod={pod}
        variant={cephfsVolume}
        volumeName={cephfsName}
      />
    ));

    expect(result.container).toMatchSnapshot();
    expect(result.getByTestId("cephfs-readonly")).toHaveTextContent("false");
  });

  it("should render 'true' for Readonly when true is provided", () => {
    const cephfsName = "my-ceph";
    const cephfsVolume: CephfsSource = {
      monitors: [],
      readOnly: true,
    };
    const pod = new Pod({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "my-pod",
        namespace: "default",
        resourceVersion: "1",
        uid: "123",
        selfLink: "/api/v1/pod/default/my-pod",
      },
      spec: {
        volumes: [{
          name: cephfsName,
          cephfs: cephfsVolume,
        }],
      },
    });
    const result = render((
      <CephFs
        pod={pod}
        variant={cephfsVolume}
        volumeName={cephfsName}
      />
    ));

    expect(result.container).toMatchSnapshot();
    expect(result.getByTestId("cephfs-readonly")).toHaveTextContent("true");
  });
});
