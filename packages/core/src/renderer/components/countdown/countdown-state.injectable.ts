/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import {
  computed,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  runInAction,
} from "mobx";

const countdownStateInjectable = getInjectable({
  id: "countdown-state",

  instantiate: (
    di,
    { startFrom, onZero }: { startFrom: number; onZero: () => void },
  ) => {
    const state = observable.box(startFrom);

    let intervalId: NodeJS.Timer | undefined;

    const stop = () => {
      clearInterval(intervalId);
    };

    const start = () => {
      intervalId = setInterval(() => {
        const secondsLeft = state.get() - 1;

        runInAction(() => {
          state.set(secondsLeft);
        });

        if (secondsLeft === 0) {
          stop();
          onZero();
        }
      }, 1000);
    };

    onBecomeObserved(state, start);
    onBecomeUnobserved(state, stop);

    return computed(() => state.get());
  },

  lifecycle: lifecycleEnum.transient,
});

export default countdownStateInjectable;
