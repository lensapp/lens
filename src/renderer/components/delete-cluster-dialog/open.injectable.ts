/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { DeleteClusterDialogState } from "./state.injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";

export type OpenDeleteClusterDialog = (props: DeleteClusterDialogState) => void;

const openDeleteClusterDialogInjectable = getInjectable({
  id: "open-delete-cluster-dialog",
  instantiate: (di): OpenDeleteClusterDialog => {
    const state = di.inject(deleteClusterDialogStateInjectable);

    return (props) => state.set(props);
  },
});

export default openDeleteClusterDialogInjectable;
