import {
  getInjectable,
  getInjectionToken,
  lifecycleEnum,
} from "@ogre-tools/injectable";
import type { AnySchema } from "ajv";

import { computed, IComputedValue, observable, runInAction } from "mobx";
import type { JsonValue } from "type-fest";
import {
  readJsonFileInjectionToken,
  writeJsonFileInjectionToken,
} from "@lensapp/fs";
import { validateJsonSchema, withThrownFailuresUnless } from "@lensapp/utils";
import { constant } from "lodash/fp";
import { logErrorInjectionToken } from "@lensapp/logging";
import {
  appPathsInjectionToken,
  joinPathsInjectionToken,
} from "@lensapp/app-paths";

export type CreatePersistedStateConfig<T extends JsonValue> = {
  id: string;
  schema: AnySchema;
  defaultValue: T;
};

export type NonPendingPersistedStateResult<T extends JsonValue> = {
  pending: false;
  value: T;
};

export type PendingPersistedStateResult = {
  pending: true;
};

export type PersistedStateResult<T extends JsonValue> =
  | NonPendingPersistedStateResult<T>
  | PendingPersistedStateResult;

export const persistedStateInjectionToken = getInjectionToken<
  PersistedState<any>
>({
  id: "persisted-state-injection-token",
});

export const createPersistedStateInjectionToken =
  getInjectionToken<CreatePersistedState>({
    id: "create-persisted-state-injection-token",
  });

export interface PersistedState<T extends JsonValue> {
  result: IComputedValue<PersistedStateResult<T>>;
  getAsyncValue: () => Promise<T>;
  set: (newValue: T) => void;
}

export type CreatePersistedState = <T extends JsonValue>(
  config: CreatePersistedStateConfig<T>
) => PersistedState<T>;

export const stateBoxInjectable = getInjectable({
  id: "persisted-state-box",

  instantiate: () => observable.box(),

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, id: string) => id,
  }),
});

export const createPersistedStateInjectable = getInjectable({
  id: "create-persisted-state",

  instantiate: (di) => {
    const readJsonFileWithThrownFailures = di.inject(
      readJsonFileInjectionToken
    );

    const readJsonFile = withThrownFailuresUnless(
      errorIsAboutMissingFile,
      errorIsAboutAnythingElse
    )(readJsonFileWithThrownFailures);

    const writeJsonFile = withThrownFailuresUnless(constant(true))(
      di.inject(writeJsonFileInjectionToken)
    );

    const logError = di.inject(logErrorInjectionToken);
    const appPaths = di.inject(appPathsInjectionToken);
    const joinPaths = di.inject(joinPathsInjectionToken);

    const alreadyCreated = new Set<string>();

    return <T extends JsonValue>({
      id: persistedStateId,
      defaultValue,
      schema,
    }: CreatePersistedStateConfig<T>) => {
      if (alreadyCreated.has(persistedStateId)) {
        throw new Error(
          `Tried to create persisted state for "${persistedStateId}", but it was already created`
        );
      }

      const validateSchema = validateJsonSchema(getFileSchema(schema));

      alreadyCreated.add(persistedStateId);

      const stateJsonPath = joinPaths(
        appPaths.userData,
        `persisted-states/${persistedStateId}.json`
      );

      const valueBox = observable.box(defaultValue);
      const pendingBox = observable.box(true);

      let stallAsyncValue = readJsonFile(stateJsonPath).then(
        (stateValueCall) => {
          if (!stateValueCall.callWasSuccessful) {
            if (!errorIsAboutMissingFile(stateValueCall.error.cause)) {
              logError(
                `Tried to read persisted states from "${stateJsonPath}" but it failed with:\n\n${stateValueCall.error.message}`
              );
            }

            runInAction(() => {
              pendingBox.set(false);
            });

            return;
          }

          const response = stateValueCall.response;

          const validated = validateSchema(response);

          if (validated.valid) {
            runInAction(() => {
              valueBox.set(response.value);
              pendingBox.set(false);
            });
          }
        }
      );

      return {
        result: computed(() =>
          pendingBox.get()
            ? { pending: true as const }
            : {
                pending: false as const,
                value: valueBox.get(),
              }
        ),

        set: async (newValue: T) => {
          if (pendingBox.get()) {
            throw new Error(
              `Tried to set a persisted state for "${persistedStateId}", but call for the existing persisted state hadn't finished yet`
            );
          }

          const latestGoodValue = valueBox.get();

          const validateSchema = validateJsonSchema(schema);

          const validated = validateSchema(newValue);

          if (!validated.valid) {
            throw new Error(
              `Tried to set value of persisted state "${persistedStateId}" but validation of new value failed with:\n\n${JSON.stringify(
                validated.validationErrors,
                null,
                2
              )}`
            );
          }

          runInAction(() => {
            valueBox.set(newValue);
          });

          const resultPromise = writeJsonFile(stateJsonPath, {
            version: 1,
            value: newValue,
          });

          stallAsyncValue = resultPromise as Promise<any>;

          const result = await resultPromise;

          if (!result.callWasSuccessful) {
            runInAction(() => {
              valueBox.set(latestGoodValue);
            });

            logError(
              `Tried to persist state to "${stateJsonPath}" but attempt failed with:\n\n${result.error.message}`
            );
          }
        },

        getAsyncValue: async () => {
          await stallAsyncValue;

          return valueBox.get();
        },
      };
    };
  },

  injectionToken: createPersistedStateInjectionToken,
});

const getFileSchema = (valueSchema: AnySchema) => ({
  type: "object",

  properties: {
    version: { type: "number" },
    value: valueSchema,
  },

  required: ["version", "value"],
  additionalProperties: false,
});

const errorIsAboutMissingFile = (error: unknown) =>
  (error as any).code === "ENOENT";

const errorIsAboutAnythingElse = () => true;
