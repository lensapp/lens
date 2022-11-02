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
}: { isShownOnlyOnMac?: boolean } & Omit<
  Separator,
  "kind" | "isShown"
>) =>
  getInjectable({
    id: `application-menu-separator/${id}`,

    instantiate: (di) => {
      const isMac = di.inject(isMacInjectable);
      const isShown = isShownOnlyOnMac ? isMac : true;

      return {
        ...rest,
        id,
        kind: "separator" as const,
        isShown,
      };
    },

    injectionToken: applicationMenuItemInjectionToken,
  });

export { getApplicationMenuSeparatorInjectable };
