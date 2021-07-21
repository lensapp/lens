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

import type { KubeConfig } from "@kubernetes/client-node";
import React from "react";
import type { Cluster } from "../../../main/cluster";
import { ControlFlow, iter } from "../../utils";
import { ConfirmDialog } from "../confirm-dialog";
import { Select } from "../select";

export interface DeleteClusterDialogArgs {
  config: KubeConfig;
  cluster: Cluster;
}

export async function deleteClusterConfirmDialog({ config, cluster }: DeleteClusterDialogArgs): Promise<[ControlFlow.Stop] | [ControlFlow.Continue, string | false]> {
  const contextNames = new Set(config.getContexts().map(({ name }) => name));

  contextNames.delete(cluster.contextName);

  if (config.currentContext !== cluster.contextName || contextNames.size === 0) {
    return [ControlFlow.Continue, false];
  }

  const options = [
    {
      label: "--unset current-context--",
      value: false,
    },
    ...iter.map(contextNames, name => ({
      label: name,
      value: name,
    })),
  ];
  let selectedOption: string | false = false;
  const didConfirm = await ConfirmDialog.confirm({
    labelOk: "Select context",
    message: (
      <>
        <p>
          The context you are deleting is the <code>current-context</code> in the <code>{cluster.kubeConfigPath}</code> file.
          Please select one of the other contexts to replace it with.
        </p>
        <br />
        <Select
          options={options}
          onChange={({ value }) => selectedOption = value}
          themeName="light"
        />
      </>
    )
  });

  if (didConfirm) {
    return [ControlFlow.Continue, selectedOption];
  }

  return [ControlFlow.Stop];
}
