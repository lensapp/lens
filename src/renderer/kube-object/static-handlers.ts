/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectHandlerRegistration } from "./handler";
import { StatefulSetScaleDialog } from "../components/+workloads-statefulsets/statefulset-scale-dialog";
import type { StatefulSet } from "../../common/k8s-api/endpoints";

export const staticKubeObjectContextMenuHandlers: KubeObjectHandlerRegistration[] = [
  {
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    onContextMenuOpen: (ctx) => {
      ctx.menuItems.push({
        icon: "open_with",
        title: "Scale",
        onClick: (obj: StatefulSet) => StatefulSetScaleDialog.open(obj),
      });
    },
  },
];
