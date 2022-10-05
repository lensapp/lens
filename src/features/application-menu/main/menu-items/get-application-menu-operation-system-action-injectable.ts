/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { OsActionMenuItem } from "./application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./application-menu-item-injection-token";

const getApplicationMenuOperationSystemActionInjectable = ({
  id,
  ...rest
}: Omit<OsActionMenuItem, "kind" >) =>
  getInjectable({
    id: `application-menu-operation-system-action/${id}`,

    instantiate: () => ({
      ...rest,
      id,
      kind: "os-action-menu-item" as const,
    }),

    injectionToken: applicationMenuItemInjectionToken,
  });

export { getApplicationMenuOperationSystemActionInjectable };
