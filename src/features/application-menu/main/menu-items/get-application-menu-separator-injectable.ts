/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Separator } from "./application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./application-menu-item-injection-token";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";

const getApplicationMenuSeparatorInjectable = ({
  id,
  isShownOnlyOnMac = false,
  ...rest
}: { id: string; isShownOnlyOnMac?: boolean } & Omit<Separator, "type">) =>
  getInjectable({
    id: `application-menu-separator/${id}`,

    instantiate: (di) => {
      const isMac = di.inject(isMacInjectable);
      const isShown = isShownOnlyOnMac ? isMac : true;

      return {
        ...rest,
        isShown,
        type: "separator" as const,
      };
    },

    injectionToken: applicationMenuItemInjectionToken,
  });

export { getApplicationMenuSeparatorInjectable };
