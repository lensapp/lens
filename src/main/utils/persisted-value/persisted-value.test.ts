/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";

import { getInjectionToken, getInjectable } from "@ogre-tools/injectable";

import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import getAbsolutePathInjectable from "../../../common/path/get-absolute-path.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { pipeline } from "@ogre-tools/fp";
import { forEach, map } from "lodash/fp";
import { overrideFsWithFakes } from "../../../test-utils/override-fs-with-fakes";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";

interface PersistedValue {
  id: string;
  get: () => string;
  set: (arg: string) => void;
}

const persistedValueInjectionToken = getInjectionToken<PersistedValue>({
  id: "persisted-value",
});

const fetchInitialPersistedValuesInjectable = getInjectable({
  id: "fetch-initial-persisted-values",

  instantiate: (di) => {
    const statesForPersistedValues = di.injectMany(
      persistedValueInjectionToken,
    );

    const readJsonFile = di.inject(readJsonFileInjectable);
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return {
      run: async () => {
        await pipeline(
          statesForPersistedValues,

          map(async (state) => ({
            state,

            persisted: await readJsonFile(
              getAbsolutePath(
                directoryForUserData,
                "persisted-values",
                `${state.id}.json`,
              ),
            ),
          })),

          (x) => Promise.all(x),

          forEach((x) => {
            x.state.set(x.persisted.value);
            console.log(x);
          }),
        );
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

describe("persisted-value", () => {
  let di: DiContainer;
  let somePersistedValue: PersistedValue;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "/some-directory");

    overrideFsWithFakes(di);

    di.register(
      somePersistedValueInjectable,
      fetchInitialPersistedValuesInjectable,
    );

    somePersistedValue = di.inject(somePersistedValueInjectable);
  });

  describe("given a persisted value exists, when initial persisted values are fetched", () => {
    beforeEach(async () => {
      const writeJsonFile = di.inject(writeJsonFileInjectable);

      await writeJsonFile("/some-directory/persisted-values/janne.json", {
        value: {
          someProperty: "some-existing-persisted-value",
        },
      });

      const { run: fetchInitialPersistedValues } = di.inject(
        fetchInitialPersistedValuesInjectable,
      );

      await fetchInitialPersistedValues();
    });

    it("sets initial value for the persisted value", () => {
      expect(somePersistedValue.get()).toEqual({
        someProperty: "some-existing-persisted-value",
      });
    });
  });
});

interface SomeState {
  someProperty: string;
}

const somePersistedValueInjectable = getInjectable({
  id: "some-persisted-value",

  instantiate: () => {
    let state: SomeState;

    return {
      id: "janne",
      get: () => state,

      set: (value: SomeState) => {
        state = value;
      },
    };
  },

  injectionToken: persistedValueInjectionToken,
});
