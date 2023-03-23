import { noop } from "lodash/fp";
import { _resetGlobalState, configure } from "mobx";

export const runWithThrownMobxReactions = (callback: () => void) => {
  const originalConsoleWarn = console.warn;

  console.warn = noop;

  configure({
    disableErrorBoundaries: true,
  });

  console.warn = originalConsoleWarn;

  let error: any;

  try {
    callback();
  } catch (e) {
    error = e;
  } finally {
    configure({
      disableErrorBoundaries: false,
    });

    // This is because when disableErrorBoundaries is true, MobX doesn't recover from the thrown
    // errors, and its global state starts bleeding between tests making.
    _resetGlobalState();

    if (!error) {
      throw new Error(
        "Tried to run with thrown MobX reactions but nothing was thrown"
      );
    } else {
      throw error;
    }
  }
};
