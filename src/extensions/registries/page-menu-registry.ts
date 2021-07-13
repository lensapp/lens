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
