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
import type { Cluster } from "../../../../main/cluster";
import { boundMethod } from "../../../utils";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { HotbarIcon } from "../../hotbar/hotbar-icon";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import { FilePicker, OverSizeLimitStyle } from "../../file-picker";
import { MenuActions, MenuItem } from "../../menu";

enum GeneralInputStatus {
  CLEAN = "clean",
  ERROR = "error",
}

interface Props {
  cluster: Cluster;
  entity: KubernetesCluster
}

@observer
export class ClusterIconSetting extends React.Component<Props> {
  @observable status = GeneralInputStatus.CLEAN;
  @observable errorText?: string;

  private element = React.createRef<HTMLDivElement>();

  @boundMethod
  async onIconPick([file]: File[]) {
    if (!file) {
      return;
    }

    const { cluster } = this.props;

    try {
      const buf = Buffer.from(await file.arrayBuffer());

      cluster.preferences.icon = `data:${file.type};base64,${buf.toString("base64")}`;
    } catch (e) {
      this.errorText = e.toString();
      this.status = GeneralInputStatus.ERROR;
    }
  }

  clearIcon() {
    this.props.cluster.preferences.icon = undefined;
  }

  @boundMethod
  onUploadClick() {
    this.element
      .current
      .querySelector<HTMLInputElement>("input[type=file]")
      .click();
  }

  render() {
    const { entity } = this.props;

    return (
      <div ref={this.element}>
        <div className="file-loader flex flex-row items-center">
          <div className="mr-5">
            <FilePicker
              accept="image/*"
              label={
                <HotbarIcon
                  uid={entity.metadata.uid}
                  title={entity.metadata.name}
                  source={entity.metadata.source}
                  src={entity.spec.icon?.src}
                  size={53}
                />
              }
              onOverSizeLimit={OverSizeLimitStyle.FILTER}
              handler={this.onIconPick}
            />
          </div>
          <MenuActions
            toolbar={false}
            autoCloseOnSelect={true}
            triggerIcon={{ material: "more_horiz" }}
          >
            <MenuItem onClick={this.onUploadClick}>
              Upload Icon
            </MenuItem>
            <MenuItem onClick={() => this.clearIcon()} disabled={!this.props.cluster.preferences.icon}>
              Clear
            </MenuItem>
          </MenuActions>
        </div>
      </div>
    );
  }
}
