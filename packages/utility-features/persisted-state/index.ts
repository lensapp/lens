import { feature } from "./src/feature";

export {
  createPersistedStateInjectionToken,
  persistedStateInjectionToken,
} from "./src/create-persisted-state/create-persisted-state.injectable";

export type {
  CreatePersistedState,
  CreatePersistedStateConfig,
  PersistedState,
  PersistedStateResult,
  NonPendingPersistedStateResult,
  PendingPersistedStateResult,
} from "./src/create-persisted-state/create-persisted-state.injectable";

export default feature;
