/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PathPickOpts } from "../../../renderer/components/path-picker";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { openPathPickingDialogChannel } from "../common/channel";

export type OpenPathPickingDialog = (options: PathPickOpts) => Promise<void>;

const openPathPickingDialogInjectable = getInjectable({
  id: "open-path-picking-dialog",
  instantiate: (di): OpenPathPickingDialog => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return async (options) => {
      const { onPick, onCancel, ...dialogOptions } = options;
      const response = await requestFromChannel(openPathPickingDialogChannel, dialogOptions);

      if (response.canceled) {
        await onCancel?.();
      } else {
        await onPick?.(response.paths);
      }
    };
  },
});

export default openPathPickingDialogInjectable;
