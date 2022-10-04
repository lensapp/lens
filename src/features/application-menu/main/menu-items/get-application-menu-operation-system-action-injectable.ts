/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { OperationSystemAction } from "./application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./application-menu-item-injection-token";

const getApplicationMenuOperationSystemActionInjectable = ({
  id,
  role,
  ...rest
}: { id: string } & OperationSystemAction) =>
  getInjectable({
    id: `application-menu-operation-system-action/${id}`,

    instantiate: () => ({
      ...rest,
      role,
    }),

    injectionToken: applicationMenuItemInjectionToken,
  });

export { getApplicationMenuOperationSystemActionInjectable };
