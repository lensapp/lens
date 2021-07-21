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
import { observer } from "mobx-react";
import type { Cluster } from "../../../../main/cluster";
import { SubTitle } from "../../layout/sub-title";
import { EditableList } from "../../editable-list";
import { observable, makeObservable } from "mobx";
import { systemName } from "../../input/input_validators";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterAccessibleNamespaces extends React.Component<Props> {
  @observable namespaces = new Set(this.props.cluster.accessibleNamespaces);

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <>
        <SubTitle title="Accessible Namespaces" id="accessible-namespaces" />
        <EditableList
          placeholder="Add new namespace..."
          add={(newNamespace) => {
            this.namespaces.add(newNamespace);
            this.props.cluster.accessibleNamespaces = Array.from(this.namespaces);
          }}
          validators={systemName}
          items={Array.from(this.namespaces)}
          remove={({ oldItem: oldNamespace }) => {
            this.namespaces.delete(oldNamespace);
            this.props.cluster.accessibleNamespaces = Array.from(this.namespaces);
          }}
          inputTheme="round-black"
        />
        <small className="hint">
        This setting is useful for manually specifying which namespaces you have access to. This is useful when you do not have permissions to list namespaces.
        </small>
      </>
    );
  }
}
