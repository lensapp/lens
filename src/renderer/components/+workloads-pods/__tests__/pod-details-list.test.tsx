/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import { fireEvent } from "@testing-library/react";
import React from "react";
import directoryForLensLocalStorageInjectable from "../../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import fetchInjectable, { Fetch } from "../../../../common/fetch/fetch.injectable";
import { Pod } from "../../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import { PodDetailsList } from "../pod-details-list";
import type { PodStore } from "../store";
import podStoreInjectable from "../store.injectable";

const runningPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar",
    resourceVersion: "foobar",
    uid: "foobar",
    ownerReferences: [{
      uid: "runningReplicaSet",
      apiVersion: "v1",
      kind: "ReplicaSet",
      name: "running",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/foobar",
  },
  status: {
    phase: "Running",
    conditions: [
      {
        type: "Initialized",
        status: "True",
        lastProbeTime: 1,
        lastTransitionTime: "1",
      },
      {
        type: "Ready",
        status: "True",
        lastProbeTime: 1,
        lastTransitionTime: "1",
      },
    ],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
    containerStatuses: [],
    initContainerStatuses: [],
  },
});

const pendingPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-pending",
    resourceVersion: "foobar",
    uid: "foobar-pending",
    ownerReferences: [{
      uid: "pendingReplicaSet",
      apiVersion: "v1",
      kind: "ReplicaSet",
      name: "pending",
    }],
    namespace: "default",
    selfLink: "/apis/apps/v1/replicasets/default/foobar-pending",
  },
});

const failedPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-failed",
    resourceVersion: "foobar",
    uid: "foobar-failed",
    ownerReferences: [{
      uid: "failedReplicaSet",
      apiVersion: "v1",
      kind: "ReplicaSet",
      name: "failed",
    }],
    namespace: "kube-system",
    selfLink: "/apis/apps/v1/replicasets/default/foobar-failed",
  },
  status: {
    phase: "Failed",
    conditions: [],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
  },
});

describe("<PodDetailsList />", () => {
  let di: DiContainer;
  let podStore: PodStore;
  let render: DiRender;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(
      directoryForLensLocalStorageInjectable,
      () => "/some-directory-for-lens-local-storage",
    );

    fetchMock = asyncFn();
    podStore = di.inject(podStoreInjectable);

    di.override(fetchInjectable, () => fetchMock);

    render = renderFor(di);
  });
  
  describe("when no pods passed and podStore is loaded", () => {
    beforeEach(() => {
      podStore.isLoaded = true;
    });

    it("renders", () => {
      const result = render(
        <PodDetailsList
          pods={[]}
        />
      );

      expect(result.container).toMatchSnapshot();
    });

    it("shows empty message", () => {
      const result = render(
        <PodDetailsList
          pods={[]}
        />
      );

      expect(result.getByText("No items found")).toBeInTheDocument();
    });
  });

  describe("when podStore is still loading", () => {
    it("renders spinner", () => {
      const result = render(
        <PodDetailsList
          pods={[]}
        />
      );

      expect(result.container).toMatchSnapshot();
    });
  });

  describe("when few pods passed", () => {
    beforeEach(() => {
      podStore.isLoaded = true;
    });

    it("renders table with pods", () => {
      const result = render(
        <PodDetailsList
          pods={[
            runningPod,
            failedPod,
            pendingPod,
          ]}
        />
      );

      expect(result.container).toMatchSnapshot();
    });

    describe("when metrics max values passed", () => {
      beforeEach(() => {
        podStore.getPodKubeMetrics = (pod: Pod) => {
          let cpu = 0.4;
          let memory = 1024;

          switch(pod.getId()) {
            case "foobar":
              cpu = 0.2;
              memory = 128;
              break;
            case "foobar-pending":
              cpu = 0.5;
              memory = 256;
          }

          return {
            cpu,
            memory
          }
        };
      });

      it("renders table with metric lines", () => {
        const result = render(
          <PodDetailsList
            pods={[
              runningPod,
              failedPod,
              pendingPod,
            ]}
            maxCpu={1}
            maxMemory={2048}
          />
        );

        expect(result.container).toMatchSnapshot();
      });

      it("sorts table by name", () => {
        const result = render(
          <PodDetailsList
            pods={[
              runningPod,
              failedPod,
              pendingPod,
            ]}
            maxCpu={1}
            maxMemory={2048}
          />
        );

        const column = result.getByText("Name");

        fireEvent.click(column);
        fireEvent.click(column);

        expect(result.container).toMatchSnapshot();
      });

      it("sorts table by cpu", () => {
        const result = render(
          <PodDetailsList
            pods={[
              runningPod,
              failedPod,
              pendingPod,
            ]}
            maxCpu={1}
            maxMemory={2048}
          />
        );

        const column = result.getByText("CPU");

        fireEvent.click(column);
        fireEvent.click(column);

        expect(result.container).toMatchSnapshot();
      });

      it("sorts table by memory", () => {
        const result = render(
          <PodDetailsList
            pods={[
              runningPod,
              failedPod,
              pendingPod,
            ]}
            maxCpu={1}
            maxMemory={2048}
          />
        );

        const column = result.getByText("Memory");

        fireEvent.click(column);
        fireEvent.click(column);

        expect(result.container).toMatchSnapshot();
      });
    });
  });
});