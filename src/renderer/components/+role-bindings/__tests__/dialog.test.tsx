/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ClusterRoleStore } from "../../+cluster-roles/store";
import clusterRoleStoreInjectable from "../../+cluster-roles/store.injectable";
import { ClusterRole, ClusterRoleApi } from "../../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import { RoleBindingDialog } from "../dialog";
import roleBindingDialogStateInjectable from "../dialog.state.injectable";

describe("RoleBindingDialog tests", () => {
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
    di.override(roleBindingDialogStateInjectable, () => ({
      isOpen: false,
      roleBinding: null,
    }));
    const { container } = render(<RoleBindingDialog animated={false} />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("role select should be searchable when open", async () => {
    di.override(roleBindingDialogStateInjectable, () => ({
      isOpen: true,
      roleBinding: null,
    }));
    const res = render(<RoleBindingDialog animated={false} />);

    userEvent.click(await res.findByText("Select role", { exact: false }));

    await res.findAllByText("foobar", {
      exact: false,
    });
  });
});
