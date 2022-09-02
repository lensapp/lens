/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import navigateToNamespacesInjectable from "../../../common/front-end-routing/routes/cluster/namespaces/navigate-to-namespaces.injectable";
import createEditResourceTabInjectable from "../../../renderer/components/dock/edit-resource/edit-resource-tab.injectable";
import getRandomIdForEditResourceTabInjectable from "../../../renderer/components/dock/edit-resource/get-random-id-for-edit-resource-tab.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { CallForResource } from "../../../renderer/components/dock/edit-resource/edit-resource-model/call-for-resource/call-for-resource.injectable";
import callForResourceInjectable from "../../../renderer/components/dock/edit-resource/edit-resource-model/call-for-resource/call-for-resource.injectable";
import type { CallForPatchResource } from "../../../renderer/components/dock/edit-resource/edit-resource-model/call-for-patch-resource/call-for-patch-resource.injectable";
import callForPatchResourceInjectable from "../../../renderer/components/dock/edit-resource/edit-resource-model/call-for-patch-resource/call-for-patch-resource.injectable";
import dockStoreInjectable from "../../../renderer/components/dock/dock/store.injectable";
import { Namespace } from "../../../common/k8s-api/endpoints";
import showSuccessNotificationInjectable from "../../../renderer/components/notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../../../renderer/components/notifications/show-error-notification.injectable";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import { controlWhenStoragesAreReady } from "../../../renderer/utils/create-storage/storages-are-ready";

describe("cluster/namespaces - edit namespace from new tab", () => {
  let builder: ApplicationBuilder;
  let callForNamespaceMock: AsyncFnMock<CallForResource>;
  let callForPatchNamespaceMock: AsyncFnMock<CallForPatchResource>;
  let showSuccessNotificationMock: jest.Mock;
  let showErrorNotificationMock: jest.Mock;
  let storagesAreReady: () => Promise<void>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    callForNamespaceMock = asyncFn();
    callForPatchNamespaceMock = asyncFn();

    showSuccessNotificationMock = jest.fn();
    showErrorNotificationMock = jest.fn();

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );

      windowDi.override(hostedClusterIdInjectable, () => "some-cluster-id");

      storagesAreReady = controlWhenStoragesAreReady(windowDi);

      windowDi.override(
        showSuccessNotificationInjectable,
        () => showSuccessNotificationMock,
      );

      windowDi.override(
        showErrorNotificationInjectable,
        () => showErrorNotificationMock,
      );

      windowDi.override(getRandomIdForEditResourceTabInjectable, () =>
        jest
          .fn(() => "some-irrelevant-random-id")
          .mockReturnValueOnce("some-first-tab-id")
          .mockReturnValueOnce("some-second-tab-id"),
      );

      windowDi.override(callForResourceInjectable, () => async (selfLink: string) => {
        if (
          [
            "/apis/some-api-version/namespaces/some-uid",
            "/apis/some-api-version/namespaces/some-other-uid",
          ].includes(selfLink)
        ) {
          return await callForNamespaceMock(selfLink);
        }

        return undefined;
      });

      windowDi.override(callForPatchResourceInjectable, () => async (namespace, ...args) => {
        if (
          [
            "/apis/some-api-version/namespaces/some-uid",
            "/apis/some-api-version/namespaces/some-other-uid",
          ].includes(namespace.selfLink)
        ) {
          return await callForPatchNamespaceMock(namespace, ...args);
        }

        return undefined;
      });
    });

    builder.allowKubeResource("namespaces");
  });

  describe("when navigating to namespaces", () => {
    let rendered: RenderResult;
    let windowDi: DiContainer;

    beforeEach(async () => {
      rendered = await builder.render();

      await storagesAreReady();

      windowDi = builder.applicationWindow.only.di;

      const navigateToNamespaces = windowDi.inject(
        navigateToNamespacesInjectable,
      );

      navigateToNamespaces();

      const dockStore = windowDi.inject(dockStoreInjectable);

      // TODO: Make TerminalWindow unit testable to allow realistic behaviour
      dockStore.closeTab("terminal");
    });

    // TODO: Implement skipped tests when loading of resources can be tested
    xit("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    xit("calls for namespaces", () => {

    });

    xit("shows spinner", () => {

    });

    describe("when namespaces resolve", () => {
      beforeEach(() => {

      });

      xit("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      xit("does not show spinner anymore", () => {

      });

      describe("when clicking the context menu for a namespace", () => {
        beforeEach(() => {

        });

        xit("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        xit("does not show edit resource tab yet", () => {

        });

        describe("when clicking to edit namespace", () => {
          beforeEach(() => {
            // TODO: Make implementation match the description (tests above)
            const namespaceStub = new Namespace(someNamespaceDataStub);

            const createEditResourceTab = windowDi.inject(createEditResourceTabInjectable);

            createEditResourceTab(namespaceStub);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("shows dock tab for editing namespace", () => {
            expect(
              rendered.getByTestId("dock-tab-for-some-first-tab-id"),
            ).toBeInTheDocument();
          });

          it("shows spinner in the dock tab", () => {
            expect(
              rendered.getByTestId("edit-resource-tab-spinner"),
            ).toBeInTheDocument();
          });

          it("calls for namespace", () => {
            expect(callForNamespaceMock).toHaveBeenCalledWith(
              "/apis/some-api-version/namespaces/some-uid",
            );
          });

          describe("when call for namespace resolves with namespace", () => {
            let someNamespace: Namespace;

            beforeEach(async () => {
              someNamespace = new Namespace({
                apiVersion: "some-api-version",
                kind: "Namespace",

                metadata: {
                  uid: "some-uid",
                  name: "some-name",
                  resourceVersion: "some-resource-version",
                  selfLink: "/apis/some-api-version/namespaces/some-uid",
                  somePropertyToBeRemoved: "some-value",
                  somePropertyToBeChanged: "some-old-value",
                },
              });

              await callForNamespaceMock.resolve({
                callWasSuccessful: true,
                response: someNamespace,
              });
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("does not show spinner anymore", () => {
              expect(
                rendered.queryByTestId("edit-resource-tab-spinner"),
              ).not.toBeInTheDocument();
            });

            it("has the configuration in editor", () => {
              const input = rendered.getByTestId(
                "monaco-editor-for-some-first-tab-id",
              ) as HTMLTextAreaElement;

              expect(input.value).toBe(`apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeRemoved: some-value
  somePropertyToBeChanged: some-old-value
`);
            });

            describe("given no changes in the configuration, when selecting to save", () => {
              beforeEach(() => {
                const saveButton = rendered.getByTestId(
                  "save-edit-resource-from-tab-for-some-first-tab-id",
                );

                fireEvent.click(saveButton);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("calls for save with empty values", () => {
                expect(callForPatchNamespaceMock).toHaveBeenCalledWith(
                  someNamespace,
                  [],
                );
              });

              it("shows spinner", () => {
                expect(
                  rendered.getByTestId("saving-edit-resource-from-tab-for-some-first-tab-id"),
                ).toBeInTheDocument();
              });

              it("save button is disabled", () => {
                const saveButton = rendered.getByTestId(
                  "save-edit-resource-from-tab-for-some-first-tab-id",
                );

                expect(saveButton).toHaveAttribute("disabled");
              });

              it("save and close button is disabled", () => {
                const saveButton = rendered.getByTestId(
                  "save-and-close-edit-resource-from-tab-for-some-first-tab-id",
                );

                expect(saveButton).toHaveAttribute("disabled");
              });

              describe("when saving resolves with success", () => {
                beforeEach(async () => {
                  await callForPatchNamespaceMock.resolve({
                    callWasSuccessful: true,
                    response: { name: "some-name", kind: "Namespace" },
                  });
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("does not show spinner anymore", () => {
                  expect(
                    rendered.queryByTestId("saving-edit-resource-from-tab-for-some-first-tab-id"),
                  ).not.toBeInTheDocument();
                });

                it("save button is enabled", () => {
                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  expect(saveButton).not.toHaveAttribute("disabled");
                });

                it("save and close button is enabled", () => {
                  const saveButton = rendered.getByTestId(
                    "save-and-close-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  expect(saveButton).not.toHaveAttribute("disabled");
                });

                it("shows success notification", () => {
                  expect(showSuccessNotificationMock).toHaveBeenCalled();
                });

                it("does not show error notification", () => {
                  expect(showErrorNotificationMock).not.toHaveBeenCalled();
                });

                it("does not close the dock tab", () => {
                  expect(
                    rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                  ).toBeInTheDocument();
                });
              });

              describe("when saving resolves with failure", () => {
                beforeEach(async () => {
                  await callForPatchNamespaceMock.resolve({
                    callWasSuccessful: false,
                    error: "some-error",
                  });
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("does not show spinner anymore", () => {
                  expect(
                    rendered.queryByTestId("edit-resource-tab-spinner"),
                  ).not.toBeInTheDocument();
                });

                it("save button is enabled", () => {
                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  expect(saveButton).not.toHaveAttribute("disabled");
                });

                it("save and close button is enabled", () => {
                  const saveButton = rendered.getByTestId(
                    "save-and-close-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  expect(saveButton).not.toHaveAttribute("disabled");
                });

                it("does not show success notification", () => {
                  expect(showSuccessNotificationMock).not.toHaveBeenCalled();
                });

                it("shows error notification", () => {
                  expect(showErrorNotificationMock).toHaveBeenCalled();
                });

                it("does not close the dock tab", () => {
                  expect(
                    rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                  ).toBeInTheDocument();
                });
              });
            });

            describe("when selecting to save and close", () => {
              beforeEach(() => {
                const saveButton = rendered.getByTestId(
                  "save-and-close-edit-resource-from-tab-for-some-first-tab-id",
                );

                fireEvent.click(saveButton);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not close the tab yet", () => {
                expect(
                  rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                ).toBeInTheDocument();
              });

              describe("when saving resolves with success", () => {
                beforeEach(async () => {
                  await callForPatchNamespaceMock.resolve({
                    callWasSuccessful: true,
                    response: { name: "some-name", kind: "Namespace" },
                  });
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("closes the dock tab", () => {
                  expect(
                    rendered.queryByTestId("dock-tab-for-some-first-tab-id"),
                  ).not.toBeInTheDocument();
                });
              });

              describe("when saving resolves with failure", () => {
                beforeEach(async () => {
                  await callForPatchNamespaceMock.resolve({
                    callWasSuccessful: false,
                    error: "Some error",
                  });
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                // TODO: Not doable at the moment because info panel controls closing of the tab
                xit("does not close the dock tab", () => {
                  expect(
                    rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                  ).toBeInTheDocument();
                });
              });
            });

            describe("when selecting to cancel", () => {
              beforeEach(() => {
                const cancelButton = rendered.getByTestId(
                  "cancel-edit-resource-from-tab-for-some-first-tab-id",
                );

                fireEvent.click(cancelButton);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("does not have dock tab anymore", () => {
                expect(
                  rendered.queryByTestId("dock-tab-for-some-first-tab-id"),
                ).not.toBeInTheDocument();
              });
            });

            describe("given change in configuration", () => {
              beforeEach(() => {
                const input = rendered.getByTestId(
                  "monaco-editor-for-some-first-tab-id",
                ) as HTMLInputElement;

                fireEvent.change(input, {
                  target: {
                    value: `apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
`,
                  },
                });
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("has the changed configuration in editor", () => {
                const input = rendered.getByTestId(
                  "monaco-editor-for-some-first-tab-id",
                ) as HTMLTextAreaElement;

                expect(input.value).toBe(`apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
`);
              });

              it("stores the changed configuration", async () => {
                const readJsonFile = windowDi.inject(
                  readJsonFileInjectable,
                );

                const actual = (await readJsonFile(
                  "/some-directory-for-lens-local-storage/some-cluster-id.json",
                )) as any;

                expect(
                  actual.edit_resource_store["some-first-tab-id"],
                ).toEqual({
                  resource: "/apis/some-api-version/namespaces/some-uid",
                  firstDraft: `apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeRemoved: some-value
  somePropertyToBeChanged: some-old-value
`,
                  draft: `apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
`,
                });
              });

              describe("when selecting to save", () => {
                beforeEach(() => {
                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  fireEvent.click(saveButton);
                });

                it("calls for save with changed configuration", () => {
                  expect(callForPatchNamespaceMock).toHaveBeenCalledWith(
                    someNamespace,
                    [
                      {
                        op: "remove",
                        path: "/metadata/somePropertyToBeRemoved",
                      },
                      {
                        op: "add",
                        path: "/metadata/someAddedProperty",
                        value: "some-new-value",
                      },
                      {
                        op: "replace",
                        path: "/metadata/somePropertyToBeChanged",
                        value: "some-changed-value",
                      },
                    ],
                  );
                });

                it("given save resolves and another change in configuration, when saving, calls for save with changed configuration", async () => {
                  await callForPatchNamespaceMock.resolve({
                    callWasSuccessful: true,

                    response: {
                      name: "some-name",
                      kind: "Namespace",
                    },
                  });

                  const input = rendered.getByTestId(
                    "monaco-editor-for-some-first-tab-id",
                  ) as HTMLInputElement;

                  fireEvent.change(input, {
                    target: {
                      value: `apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
  someOtherAddedProperty: some-other-new-value
`,
                    },
                  });


                  callForPatchNamespaceMock.mockClear();

                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  fireEvent.click(saveButton);

                  expect(callForPatchNamespaceMock).toHaveBeenCalledWith(
                    someNamespace,
                    [
                      {
                        op: "add",
                        path: "/metadata/someOtherAddedProperty",
                        value: "some-other-new-value",
                      },
                    ],
                  );
                });
              });
            });

            describe("given invalid change in configuration", () => {
              beforeEach(() => {
                const input = rendered.getByTestId(
                  "monaco-editor-for-some-first-tab-id",
                ) as HTMLInputElement;

                fireEvent.change(input, {
                  target: {
                    value: "@some-invalid-configuration@",
                  },
                });
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("has the changed configuration in editor", () => {
                const input = rendered.getByTestId(
                  "monaco-editor-for-some-first-tab-id",
                ) as HTMLTextAreaElement;

                expect(input.value).toBe(`@some-invalid-configuration@`);
              });

              it("save button is disabled", () => {
                const saveButton = rendered.getByTestId(
                  "save-edit-resource-from-tab-for-some-first-tab-id",
                );

                expect(saveButton).toHaveAttribute("disabled");
              });

              it("save and close button is disabled", () => {
                const saveButton = rendered.getByTestId(
                  "save-and-close-edit-resource-from-tab-for-some-first-tab-id",
                );

                expect(saveButton).toHaveAttribute("disabled");
              });

              describe("when valid change in configuration", () => {

                beforeEach(() => {
                  const input = rendered.getByTestId(
                    "monaco-editor-for-some-first-tab-id",
                  ) as HTMLInputElement;


                  fireEvent.change(input, {
                    target: {
                      value: `apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
`,
                    },
                  });

                });

                it("save button is enabled", () => {
                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  expect(saveButton).not.toHaveAttribute("disabled");
                });

                it("save and close button is enabled", () => {
                  const saveButton = rendered.getByTestId(
                    "save-and-close-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  expect(saveButton).not.toHaveAttribute("disabled");
                });
              });

            });

            describe("given clicking the context menu for second namespace, when clicking to edit namespace", () => {
              beforeEach(() => {
                callForNamespaceMock.mockClear();

                // TODO: Make implementation match the description
                const namespaceStub = new Namespace(someOtherNamespaceDataStub);

                const createEditResourceTab = windowDi.inject(createEditResourceTabInjectable);

                createEditResourceTab(namespaceStub);
              });

              it("renders", () => {
                expect(rendered.baseElement).toMatchSnapshot();
              });

              it("shows dock tab for editing second namespace", () => {
                expect(
                  rendered.getByTestId("dock-tab-content-for-some-second-tab-id"),
                ).toBeInTheDocument();
              });

              it("still has dock tab for first namespace", () => {
                expect(
                  rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                ).toBeInTheDocument();
              });

              it("shows spinner in the dock tab", () => {
                expect(
                  rendered.getByTestId("edit-resource-tab-spinner"),
                ).toBeInTheDocument();
              });

              it("calls for second namespace", () => {
                expect(callForNamespaceMock).toHaveBeenCalledWith(
                  "/apis/some-api-version/namespaces/some-other-uid",
                );
              });

              describe("when second namespace resolves", () => {
                let someOtherNamespace: Namespace;

                beforeEach(async () => {
                  someOtherNamespace = new Namespace({
                    apiVersion: "some-api-version",
                    kind: "Namespace",

                    metadata: {
                      uid: "some-other-uid",
                      name: "some-other-name",
                      resourceVersion: "some-resource-version",
                      selfLink:
                        "/apis/some-api-version/namespaces/some-other-uid",
                    },
                  });

                  await callForNamespaceMock.resolve({
                    callWasSuccessful: true,
                    response: someOtherNamespace,
                  });
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("has the configuration in editor", () => {
                  const input = rendered.getByTestId(
                    "monaco-editor-for-some-second-tab-id",
                  ) as HTMLTextAreaElement;

                  expect(input.value).toBe(`apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-other-uid
  name: some-other-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-other-uid
`);
                });

                it("when selecting to save, calls for save of second namespace", () => {
                  callForPatchNamespaceMock.mockClear();

                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-second-tab-id",
                  );

                  fireEvent.click(saveButton);

                  expect(callForPatchNamespaceMock).toHaveBeenCalledWith(
                    someOtherNamespace,
                    [],
                  );
                });

                describe("when clicking dock tab for the first namespace", () => {
                  beforeEach(() => {
                    callForNamespaceMock.mockClear();

                    const tab = rendered.getByTestId("dock-tab-for-some-first-tab-id");

                    fireEvent.click(tab);
                  });

                  it("renders", () => {
                    expect(rendered.baseElement).toMatchSnapshot();
                  });

                  it("shows dock tab for editing first namespace", () => {
                    expect(
                      rendered.getByTestId("dock-tab-content-for-some-first-tab-id"),
                    ).toBeInTheDocument();
                  });

                  it("still has dock tab for second namespace", () => {
                    expect(
                      rendered.getByTestId("dock-tab-for-some-second-tab-id"),
                    ).toBeInTheDocument();
                  });

                  it("does not show spinner in the dock tab", () => {
                    expect(
                      rendered.queryByTestId("edit-resource-tab-spinner"),
                    ).not.toBeInTheDocument();
                  });

                  it("does not call for namespace", () => {
                    expect(callForNamespaceMock).not.toHaveBeenCalled();
                  });

                  it("has configuration in the editor", () => {
                    const input = rendered.getByTestId(
                      "monaco-editor-for-some-first-tab-id",
                    ) as HTMLTextAreaElement;

                    expect(input.value).toBe(`apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  selfLink: /apis/some-api-version/namespaces/some-uid
  somePropertyToBeRemoved: some-value
  somePropertyToBeChanged: some-old-value
`);
                  });

                  it("when selecting to save, calls for save of first namespace", () => {
                    callForPatchNamespaceMock.mockClear();

                    const saveButton = rendered.getByTestId(
                      "save-edit-resource-from-tab-for-some-first-tab-id",
                    );

                    fireEvent.click(saveButton);

                    expect(callForPatchNamespaceMock).toHaveBeenCalledWith(
                      someNamespace,
                      [],
                    );
                  });
                });
              });
            });
          });

          describe("when call for namespace resolves without namespace", () => {
            beforeEach(async () => {
              await callForNamespaceMock.resolve({
                callWasSuccessful: true,
                response: undefined,
              });
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("still shows the dock tab for editing namespace", () => {
              expect(
                rendered.getByTestId("dock-tab-for-some-first-tab-id"),
              ).toBeInTheDocument();
            });

            it("shows error message", () => {
              expect(
                rendered.getByTestId("dock-tab-content-for-some-first-tab-id"),
              ).toHaveTextContent("Resource not found");
            });

            it("does not show error notification", () => {
              expect(showErrorNotificationMock).not.toHaveBeenCalled();
            });
          });

          describe("when call for namespace resolves with failure", () => {
            beforeEach(async () => {
              await callForNamespaceMock.resolve({
                callWasSuccessful: false,
                error: "some-error",
              });
            });

            it("renders", () => {
              expect(rendered.baseElement).toMatchSnapshot();
            });

            it("still shows the dock tab for editing namespace", () => {
              expect(
                rendered.getByTestId("dock-tab-for-some-first-tab-id"),
              ).toBeInTheDocument();
            });

            it("shows error message", () => {
              expect(
                rendered.getByTestId("dock-tab-content-for-some-first-tab-id"),
              ).toHaveTextContent("Resource not found");
            });

            it("shows error notification", () => {
              expect(showErrorNotificationMock).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});

const someNamespaceDataStub = {
  apiVersion: "some-api-version",
  kind: "Namespace",
  metadata: {
    uid: "some-uid",
    name: "some-name",
    resourceVersion: "some-resource-version",
    selfLink: "/apis/some-api-version/namespaces/some-uid",
  },
};

const someOtherNamespaceDataStub = {
  apiVersion: "some-api-version",
  kind: "Namespace",
  metadata: {
    uid: "some-other-uid",
    name: "some-other-name",
    resourceVersion: "some-resource-version",
    selfLink: "/apis/some-api-version/namespaces/some-other-uid",
  },
};
