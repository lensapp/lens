/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IObservableValue } from "mobx";
import { when } from "mobx";

/**
 * This function waits for a box around a future supplied value to be set and then returns it
 */
export function waitUntilSet<T>(box: IObservableValue<T | undefined>): Promise<T> {
  return new Promise<T>(resolve => {
    when(() => {
      const curVal = box.get();

      if (curVal != null) {
        resolve(curVal);

        return true;
      }

      return false;
    }, () => {});
  });
}
