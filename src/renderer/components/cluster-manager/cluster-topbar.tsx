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
import { observer } from "mobx-react";
import React from "react";

import { previousActiveTab } from "../+catalog";
import { ClusterStore } from "../../../common/cluster-store";
import { catalogURL } from "../../../common/routes";
import { navigate } from "../../navigation";
import { Icon } from "../icon";
import { TopBar } from "../layout/topbar";

import type { RouteComponentProps } from "react-router";
import type { ClusterViewRouteParams } from "../../../common/routes";
import type { Cluster } from "../../../main/cluster";
import { TooltipPosition } from "../tooltip";

interface Props extends RouteComponentProps<ClusterViewRouteParams> {
}

export const ClusterTopbar = observer((props: Props) => {
  const getCluster = (): Cluster | undefined => {
    return ClusterStore.getInstance().getById(props.match.params.clusterId);
  };

  return (
    <TopBar label={getCluster()?.name}>
      <div>
        <Icon
          style={{ cursor: "default" }}
          material="close"
          onClick={() => {
            navigate(`${catalogURL()}/${previousActiveTab.get()}`);
          }}
          tooltip={{
            preferredPositions: TooltipPosition.BOTTOM_RIGHT,
            children: "Back to Catalog"
          }}
        />
      </div>
    </TopBar>
  );
});
