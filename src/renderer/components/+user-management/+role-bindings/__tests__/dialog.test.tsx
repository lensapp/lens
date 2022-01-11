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

import userEvent from "@testing-library/user-event";
import React from "react";
import { clusterRolesStore } from "../../+cluster-roles/store";
import { ClusterRole } from "../../../../../common/k8s-api/endpoints";
import { RoleBindingDialog } from "../dialog";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import type { DiRender } from "../../../test-utils/renderFor";
import { renderFor } from "../../../test-utils/renderFor";
import directoryForUserDataInjectable
  from "../../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

jest.mock("../../+cluster-roles/store");

describe("RoleBindingDialog tests", () => {
  let render: DiRender;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

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
    RoleBindingDialog.close();
    jest.resetAllMocks();
  });

  it("should render without any errors", () => {
    const { container } = render(<RoleBindingDialog />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("role select should be searchable", async () => {
    RoleBindingDialog.open();
    const res = render(<RoleBindingDialog />);

    userEvent.click(await res.findByText("Select role", { exact: false }));

    await res.findAllByText("foobar", {
      exact: false,
    });
  });
});
