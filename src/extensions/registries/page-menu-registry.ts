/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Extensions-api -> Register page menu items
import type { IconProps } from "../../renderer/components/icon";
import type React from "react";
import type { PageTarget, RegisteredPage } from "./page-registry";
import type { LensExtension } from "../lens-extension";
import { BaseRegistry } from "./base-registry";

export interface ClusterPageMenuRegistration {
  id?: string;
  parentId?: string;
  target?: PageTarget;
  title: React.ReactNode;
  components: ClusterPageMenuComponents;
}

export interface ClusterPageMenuComponents {
  Icon: React.ComponentType<IconProps>;
}

export class ClusterPageMenuRegistry extends BaseRegistry<ClusterPageMenuRegistration> {
  add(items: ClusterPageMenuRegistration[], ext: LensExtension) {
    const normalizedItems = items.map(menuItem => {
      menuItem.target = {
        extensionId: ext.name,
        ...(menuItem.target || {}),
      };

      return menuItem;
    });

    return super.add(normalizedItems);
  }

  getRootItems() {
    return this.getItems().filter((item) => !item.parentId);
  }

  getSubItems(parent: ClusterPageMenuRegistration) {
    return this.getItems().filter((item) => (
      item.parentId === parent.id &&
      item.target.extensionId === parent.target.extensionId
    ));
  }

  getByPage({ id: pageId, extensionId }: RegisteredPage) {
    return this.getItems().find((item) => (
      item.target.pageId == pageId &&
      item.target.extensionId === extensionId
    ));
  }
}
