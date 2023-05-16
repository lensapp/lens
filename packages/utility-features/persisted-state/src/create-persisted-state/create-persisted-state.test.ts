import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import {
  createContainer,
  DiContainer,
  getInjectable,
} from "@ogre-tools/injectable";
import { reaction, runInAction } from "mobx";
import {
  CreatePersistedState,
  createPersistedStateInjectionToken,
  PersistedState,
  PersistedStateResult,
} from "./create-persisted-state.injectable";
import { registerFeature } from "@lensapp/feature-core";
import {
  ReadJsonFile,
  readJsonFileInjectionToken,
  WriteJsonFile,
  writeJsonFileInjectionToken,
} from "@lensapp/fs";
import { getSuccess } from "@lensapp/utils";
import { logErrorInjectionToken } from "@lensapp/logging";
import { appPathsInjectionToken } from "@lensapp/app-paths";
import { getPromiseStatus, useFakeTime } from "@lensapp/test-utils";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { feature } from "../feature";

describe("create persisted state", () => {
  let di: DiContainer;
  let readJsonFileMock: AsyncFnMock<ReadJsonFile>;
  let writeJsonFileMock: AsyncFnMock<WriteJsonFile>;
  let logErrorMock: jest.Mock;
  let createPersistedState: CreatePersistedState;

  beforeEach(() => {
    useFakeTime();

    di = createContainer("irrelevant");

    registerFeature(di, feature);

    di.register(appPathsFakeInjectable);

    registerMobX(di);

    readJsonFileMock = asyncFn();
    di.override(readJsonFileInjectionToken, () => readJsonFileMock);

    writeJsonFileMock = asyncFn();
    di.override(writeJsonFileInjectionToken, () => writeJsonFileMock);

    logErrorMock = jest.fn();
    di.override(logErrorInjectionToken, () => logErrorMock);

    createPersistedState = di.inject(createPersistedStateInjectionToken);
  });

  describe("when a persisted state is created", () => {
    let actualPersistedState: PersistedState<string>;

    beforeEach(() => {
      actualPersistedState = createPersistedState<string>({
        id: "some-persisted-state-id",
        defaultValue: "some-default-value",

        schema: {
          oneOf: [
            {
              enum: ["some-existing-value", "some-changed-value"],
            },

            {
              type: "null",
            },
          ],
        },
      });
    });

    it("reads persisted value", () => {
      expect(readJsonFileMock).toHaveBeenCalledWith(
        "/some-user-data-directory/persisted-states/some-persisted-state-id.json"
      );
    });

    it("when persisted state with conflicting ID is created, throws", () => {
      expect(() => {
        createPersistedState({
          id: "some-persisted-state-id",
          defaultValue: "irrelevant",
          schema: {},
        });
      }).toThrow(
        'Tried to create persisted state for "some-persisted-state-id", but it was already created'
      );
    });

    describe("when value is accessed as promise instead of observing", () => {
      let actualPromise: Promise<string>;

      beforeEach(() => {
        actualPromise = actualPersistedState.getAsyncValue();
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      describe("when existing value resolves", () => {
        beforeEach(async () => {
          await readJsonFileMock.resolve(
            getSuccess({
              version: 1,
              value: "some-existing-value",
            })
          );
        });

        it("resolves as the existing value", async () => {
          expect(await actualPromise).toBe("some-existing-value");
        });
      });
    });

    describe("when value is accessed as observation instead of promise", () => {
      let observedResult: PersistedStateResult<string>;
      let observedValue: string | undefined;

      beforeEach(() => {
        reaction(
          () => actualPersistedState.result.get(),

          (newValue) => {
            observedResult = newValue;
            observedValue = newValue.pending ? undefined : newValue.value;
          },

          { fireImmediately: true }
        );
      });

      it("state observes as pending", () => {
        expect(observedResult.pending).toBe(true);
      });

      it("when new value is set before existing value has resolved, throws", () => {
        return expect(actualPersistedState.set("irrelevant")).rejects.toThrow(
          'Tried to set a persisted state for "some-persisted-state-id", but call for the existing persisted state hadn\'t finished yet'
        );
      });

      describe("when existing value resolves", () => {
        beforeEach(async () => {
          writeJsonFileMock.mockClear();

          await readJsonFileMock.resolve(
            getSuccess({
              version: 1,
              value: "some-existing-value",
            })
          );
        });

        describe("when value is accessed as promise instead of observing", () => {
          let actualPromise: Promise<string>;

          beforeEach(() => {
            readJsonFileMock.mockClear();
            actualPromise = actualPersistedState.getAsyncValue();
          });

          it("resolves as the existing value", async () => {
            expect(await actualPromise).toBe("some-existing-value");
          });

          it("does not call for existing values again", () => {
            expect(readJsonFileMock).not.toHaveBeenCalled();
          });
        });

        it("state observes as the existing value", () => {
          expect(observedValue).toBe("some-existing-value");
        });

        it("does not persist the value again", () => {
          expect(writeJsonFileMock).not.toHaveBeenCalled();
        });

        describe("when the state is changed to a valid value", () => {
          beforeEach(() => {
            runInAction(async () => {
              await actualPersistedState.set("some-changed-value");
            });
          });

          describe("when value is accessed as promise instead of observing", () => {
            let actualPromise: Promise<string>;

            beforeEach(() => {
              readJsonFileMock.mockClear();
              actualPromise = actualPersistedState.getAsyncValue();
            });

            it("does not resolve yet", async () => {
              const promiseStatus = await getPromiseStatus(actualPromise);

              expect(promiseStatus.fulfilled).toBe(false);
            });

            it("does not call for existing values again", () => {
              expect(readJsonFileMock).not.toHaveBeenCalled();
            });

            describe("when persisting resolves", () => {
              beforeEach(async () => {
                await writeJsonFileMock.resolve(getSuccess(undefined));
              });

              it("resolves as the changed value", async () => {
                expect(await actualPromise).toBe("some-changed-value");
              });
            });
          });

          it("persists the value", () => {
            expect(writeJsonFileMock).toHaveBeenCalledWith(
              "/some-user-data-directory/persisted-states/some-persisted-state-id.json",
              { version: 1, value: "some-changed-value" }
            );
          });

          it("state observes as the changed value", () => {
            expect(observedValue).toBe("some-changed-value");
          });

          describe("when persisting resolves", () => {
            beforeEach(async () => {
              await writeJsonFileMock.resolve(getSuccess(undefined));
            });

            it("does not log error", () => {
              expect(logErrorMock).not.toHaveBeenCalled();
            });

            it("observed value is still the changed value", () => {
              expect(observedValue).toBe("some-changed-value");
            });
          });

          describe("when persisting rejects", () => {
            beforeEach(async () => {
              await writeJsonFileMock.reject(new Error("some-error"));
            });

            it("logs error", () => {
              expect(logErrorMock).toHaveBeenCalledWith(
                'Tried to persist state to "/some-user-data-directory/persisted-states/some-persisted-state-id.json" but attempt failed with:\n\nsome-error'
              );
            });

            it("observed value is the latest good value", () => {
              expect(observedValue).toBe("some-existing-value");
            });
          });
        });

        describe("when the state is changed to an invalid value", () => {
          let error: any;

          beforeEach(() => {
            runInAction(async () => {
              try {
                await actualPersistedState.set("some-invalid-value");
              } catch (e) {
                error = e;
              }
            });
          });

          it("does not persist the value", () => {
            expect(writeJsonFileMock).not.toHaveBeenCalled();
          });

          it("state observes as latest good value", () => {
            expect(observedValue).toBe("some-existing-value");
          });

          it("throws", () => {
            expect(error.message).toEqual(
              expect.stringContaining(
                'Tried to set value of persisted state "some-persisted-state-id" but validation of new value failed with:'
              )
            );
          });
        });
      });

      describe("when reading resolves with invalid content", () => {
        beforeEach(async () => {
          await readJsonFileMock.resolve(getSuccess({ version: 1, value: 42 }));
        });

        it("observes as pending (eternally)", () => {
          expect(observedResult.pending).toBe(true);
        });
      });

      describe("when reading rejects with error for non existing file", () => {
        beforeEach(async () => {
          const errorAboutMissingFile = new Error("irrelevant");

          (errorAboutMissingFile as any).code = "ENOENT";

          await readJsonFileMock.reject(errorAboutMissingFile);
        });

        it("does not log error", () => {
          expect(logErrorMock).not.toHaveBeenCalled();
        });

        it("state observes as default value", () => {
          expect(observedValue).toBe("some-default-value");
        });
      });

      describe("when reading rejects with any other error than for non existing file", () => {
        beforeEach(async () => {
          const anyOtherError = new Error("some error");

          await readJsonFileMock.reject(anyOtherError);
        });

        it("logs error", () => {
          expect(logErrorMock).toHaveBeenCalledWith(
            'Tried to read persisted states from "/some-user-data-directory/persisted-states/some-persisted-state-id.json" but it failed with:\n\nsome error'
          );
        });

        it("state observes as default value", () => {
          expect(observedValue).toBe("some-default-value");
        });
      });
    });
  });
});

const appPathsFakeInjectable = getInjectable({
  id: "app-paths-fake",
  instantiate: () =>
    ({
      userData: "/some-user-data-directory",
    } as any),
  injectionToken: appPathsInjectionToken,
});
