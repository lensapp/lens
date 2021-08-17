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

import "./pod-details-affinities.scss";
import React from "react";
import yaml from "js-yaml";
import { DrawerParamToggler, DrawerItem } from "../drawer";
import type { Pod, Deployment, DaemonSet, StatefulSet, ReplicaSet, Job } from "../../../common/k8s-api/endpoints";
import MonacoEditor from "react-monaco-editor";
import { cssNames } from "../../utils";
import { ThemeStore } from "../../theme.store";
import { UserStore } from "../../../common/user-store";

interface Props {
  workload: Pod | Deployment | DaemonSet | StatefulSet | ReplicaSet | Job;
}

export class PodDetailsAffinities extends React.Component<Props> {
  render() {
    const { workload } = this.props;
    const affinitiesNum = workload.getAffinityNumber();
    const affinities = workload.getAffinity();

    if (!affinitiesNum) return null;

    return (
      <DrawerItem name="Affinities" className="PodDetailsAffinities">
        <DrawerParamToggler label={affinitiesNum}>
          <div className="ace-container">
            <MonacoEditor
              options={{readOnly: true, ...UserStore.getInstance().getEditorOptions()}}
              className={cssNames("MonacoEditor")}
              theme={ThemeStore.getInstance().activeTheme.monacoTheme}
              language="yaml"
              value={yaml.dump(affinities)}
            />
          </div>
        </DrawerParamToggler>
      </DrawerItem>
    );
  }
}
