/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { ClusterRoleBindingDialog } from "../dialog";
import { ClusterRole, ClusterRoleApi } from "../../../../common/k8s-api/endpoints";
import userEvent from "@testing-library/user-event";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { ClusterRoleStore } from "../../+cluster-roles/store";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import clusterRoleBindingDialogStateInjectable from "../dialog.state.injectable";

describe("ClusterRoleBindingDialog tests", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    di.override(clusterRoleStoreInjectable, () => {
      const clusterRoleStore = new ClusterRoleStore(new ClusterRoleApi());

      clusterRoleStore.items.replace([
        new ClusterRole({
          apiVersion: "rbac.authorization.k8s.io/v1",
          kind: "ClusterRole",
          metadata: {
            name: "foobar",
            resourceVersion: "1",
            uid: "1",
          },
        }),
      ]);

      return clusterRoleStore;
    });
  });

  it("should render without any errors when closed", () => {
    di.override(clusterRoleBindingDialogStateInjectable, () => ({
      isOpen: false,
      clusterRoleBinding: null,
    }));
    const { container } = render(<ClusterRoleBindingDialog animated={false} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("clusterrole select should be searchable when open", async () => {
    di.override(clusterRoleBindingDialogStateInjectable, () => ({
      isOpen: true,
      clusterRoleBinding: null,
    }));
    const res = render(<ClusterRoleBindingDialog animated={false} />);

    userEvent.keyboard("a");
    await res.findAllByText("foobar");
  });
});
