/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Separator } from "./application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./application-menu-item-injection-token";

const getApplicationMenuSeparatorInjectable = ({ id, ...rest }: { id: string } & Omit<Separator, "type">) =>
  getInjectable({
    id: `application-menu-separator/${id}`,

    instantiate: () => ({
      ...rest,
      type: "separator" as const,
    }),

    injectionToken: applicationMenuItemInjectionToken,
  });

export { getApplicationMenuSeparatorInjectable };
