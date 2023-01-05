/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";

const getEditorHeightFromLinesCountInjectable = getInjectable({
  id: "get-editor-height-from-lines-number",

  instantiate: () => {
    return (linesCount: number) => {
      if (typeof linesCount !== "number") {
        throw new Error("linesNumber must be a number");
      }

      if (linesCount < 10) {
        return 90;
      }

      if (linesCount < 20) {
        return 180;
      }

      return 360;
    };
  },
});

export default getEditorHeightFromLinesCountInjectable;
