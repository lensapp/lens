/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";

// Helper for inlining middleClick checks
// <form onAuxClick={isMiddleClick(() => console.log('do some action'))}>
//    <input name="text"/>
//    <button type="submit">Action</button>
// </form>

export function isMiddleClick<E extends React.MouseEvent>(callback: (evt: E) => any) {
  return function (evt: E) {
    if(evt.button === 1) {
      return callback(evt);
    }
  };
}
