/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { PodDisruptionBudget } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { renderFor } from "../../test-utils/renderFor";
import { PodDisruptionBudgets } from "../pod-disruption-budgets";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import selectedNamespacesStorageInjectable from "../../../../features/namespace-filtering/renderer/storage.injectable";
import podDisruptionBudgetStoreInjectable from "../store.injectable";
import { Cluster } from "../../../../common/cluster/cluster";
import hostedClusterInjectable from "../../../cluster-frame-context/hosted-cluster.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import type { PodDisruptionBudgetStore } from "../store";
import type { PodDisruptionBudgetApi } from "@k8slens/kube-api";
import type { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";

describe("<PodDisruptionBudgets />", () => {
  let di: DiContainer;

  const getPdb = (spec: PodDisruptionBudget["spec"]): PodDisruptionBudget => new PodDisruptionBudget({
    apiVersion: "policy/v1",
    kind: "PodDisruptionBudget",
    metadata: {
      name: "my-pdb",
      resourceVersion: "1",
      selfLink: "/apis/policy/v1/poddistruptionbudgets/my-pdb",
      uid: "1",
      namespace: "default",
    },
    spec,
  });

  const getPodDisruptionBudgetStoreInjectableMock = (pdb: PodDisruptionBudget) => ({
    api: {
      kind: "PodDisruptionBudget",
    } as PodDisruptionBudgetApi,
    getByPath: () => pdb,
    getTotalCount: () => 1,
    contextItems: [pdb],
    pickOnlySelected: (items) => items,
    isSelectedAll: () => false,
    isSelected: () => true,
  }) as Partial<PodDisruptionBudgetStore> as (PodDisruptionBudgetStore & KubeObjectStore);

  beforeEach(() => {
    di = getDiForUnitTesting();

    di.override(hostedClusterInjectable, () => Cluster.createForTestingOnly({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(selectedNamespacesStorageInjectable, () => ({
      get: () => ({}),
    }));
  });

  describe("PDB with minAvailable 0", () => {
    const pdb = getPdb(
      {
        minAvailable: 0,
      },
    );

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      di.override(podDisruptionBudgetStoreInjectable, () => getPodDisruptionBudgetStoreInjectableMock(pdb) as any);
    });

    it("should display minAvailable as 0", () => {
      const result = renderFor(di)(<PodDisruptionBudgets />);

      expect(result.container.querySelector(".TableRow .min-available")?.textContent).toEqual("0");
    });

    it("should display maxUnavailable as N/A", () => {
      const result = renderFor(di)(<PodDisruptionBudgets />);

      expect(result.container.querySelector(".TableRow .max-unavailable")?.textContent).toEqual("N/A");
    });
  });

  describe("PDB with maxUnavailable 0", () => {
    const pdb = getPdb(
      {
        maxUnavailable: 0,
      },
    );

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      di.override(podDisruptionBudgetStoreInjectable, () => getPodDisruptionBudgetStoreInjectableMock(pdb) as any);
    });

    it("should display minAvailable as N/A", () => {
      const result = renderFor(di)(<PodDisruptionBudgets />);

      expect(result.container.querySelector(".TableRow .min-available")?.textContent).toEqual("N/A");
    });

    it("should display maxUnavailable as 0", () => {
      const result = renderFor(di)(<PodDisruptionBudgets />);

      expect(result.container.querySelector(".TableRow .max-unavailable")?.textContent).toEqual("0");
    });
  });
});
