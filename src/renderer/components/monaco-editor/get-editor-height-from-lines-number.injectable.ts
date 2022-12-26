/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";

const getEditorHeightFromLinesCountInjectable = getInjectable({
  id: "get-editor-height-from-lines-number",

  instantiate: () => {
    return (linesNumber: number) => {
      if (typeof linesNumber !== "number") {
        throw new Error("linesNumber must be a number");
      }

      if (linesNumber < 10) {
        return "small";
      }

      if (linesNumber < 20) {
        return "medium";
      }

      return "large";
    };
  },
});

export default getEditorHeightFromLinesCountInjectable;
