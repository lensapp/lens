/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Cluster } from "../../../../common/cluster/cluster";
import { autoBind } from "../../../utils";
import { observable } from "mobx";
import { observer } from "mobx-react";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import { FilePicker, OverSizeLimitStyle } from "../../file-picker";
import { MenuActions, MenuItem } from "../../menu";
import { Avatar } from "../../avatar";

enum GeneralInputStatus {
  CLEAN = "clean",
  ERROR = "error",
}

export interface ClusterIconSettingProps {
  cluster: Cluster;
  entity: KubernetesCluster;
}

@observer
export class ClusterIconSetting extends React.Component<ClusterIconSettingProps> {
  @observable status = GeneralInputStatus.CLEAN;
  @observable errorText?: string;

  constructor(props: ClusterIconSettingProps) {
    super(props);
    autoBind(this);
  }

  private element = React.createRef<HTMLDivElement>();

  async onIconPick([file]: File[]) {
    if (!file) {
      return;
    }

    const { cluster } = this.props;

    try {
      const buf = Buffer.from(await file.arrayBuffer());

      cluster.preferences.icon = `data:${file.type};base64,${buf.toString("base64")}`;
    } catch (e) {
      this.errorText = String(e);
      this.status = GeneralInputStatus.ERROR;
    }
  }

  clearIcon() {
    /**
     * NOTE: this needs to be `null` rather than `undefined` so that we can
     * tell the difference between it not being there and being cleared.
     */
    this.props.cluster.preferences.icon = null;
  }

  onUploadClick() {
    this.element
      .current
      ?.querySelector<HTMLInputElement>("input[type=file]")
      ?.click();
  }

  render() {
    const { entity } = this.props;

    return (
      <div ref={this.element}>
        <div className="file-loader flex flex-row items-center">
          <div className="mr-5">
            <FilePicker
              accept="image/*"
              label={(
                <Avatar
                  colorHash={`${entity.getName()}-${entity.metadata.source}`}
                  title={entity.getName()}
                  src={entity.spec.icon?.src}
                  size={53}
                />
              )}
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
