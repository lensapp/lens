/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { ClusterRoleBindingDialog } from "../dialog";
import { clusterRolesStore } from "../../+cluster-roles/store";
import { ClusterRole } from "../../../../../common/k8s-api/endpoints";
import userEvent from "@testing-library/user-event";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../../test-utils/renderFor";

jest.mock("../../+cluster-roles/store");

describe("ClusterRoleBindingDialog tests", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();

    render = renderFor(di);

    (clusterRolesStore as any).items = [new ClusterRole({
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "ClusterRole",
      metadata: {
        name: "foobar",
        resourceVersion: "1",
        uid: "1",
      },
    })];
  });

  afterEach(() => {
    ClusterRoleBindingDialog.close();
    jest.resetAllMocks();
  });

  it("should render without any errors", () => {
    const { container } = render(<ClusterRoleBindingDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("clusterrole select should be searchable", async () => {
    ClusterRoleBindingDialog.open();
    const res = render(<ClusterRoleBindingDialog />);

    userEvent.keyboard("a");
    await res.findAllByText("foobar");
  });
});
