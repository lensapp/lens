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
import dockStoreInjectable from "../../../renderer/components/dock/dock/store.injectable";
import { Namespace } from "@k8slens/kube-object";
import showSuccessNotificationInjectable from "../../../renderer/components/notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../../../renderer/components/notifications/show-error-notification.injectable";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import type { ApiKubePatch } from "../../../renderer/k8s/api-kube-patch.injectable";
import type { ApiKubeGet } from "../../../renderer/k8s/api-kube-get.injectable";
import apiKubePatchInjectable from "../../../renderer/k8s/api-kube-patch.injectable";
import apiKubeGetInjectable from "../../../renderer/k8s/api-kube-get.injectable";
import type { BaseKubeJsonApiObjectMetadata, KubeObjectScope, KubeJsonApiData } from "@k8slens/kube-object";
import { JsonApiErrorParsed } from "../../../common/k8s-api/json-api";
import type { ShowNotification } from "../../../renderer/components/notifications";
import React from "react";

describe("cluster/namespaces - edit namespace from new tab", () => {
  let builder: ApplicationBuilder;
  let apiKubePatchMock: AsyncFnMock<ApiKubePatch>;
  let apiKubeGetMock: AsyncFnMock<ApiKubeGet>;
  let showSuccessNotificationMock: jest.MockedFunction<ShowNotification>;
  let showErrorNotificationMock: jest.MockedFunction<ShowNotification>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );

      windowDi.override(hostedClusterIdInjectable, () => "some-cluster-id");

      showSuccessNotificationMock = jest.fn();
      windowDi.override(showSuccessNotificationInjectable, () => showSuccessNotificationMock);

      showErrorNotificationMock = jest.fn();
      windowDi.override(showErrorNotificationInjectable, () => showErrorNotificationMock);

      windowDi.override(getRandomIdForEditResourceTabInjectable, () =>
        jest
          .fn(() => "some-irrelevant-random-id")
          .mockReturnValueOnce("some-first-tab-id")
          .mockReturnValueOnce("some-second-tab-id"),
      );

      apiKubePatchMock = asyncFn();
      windowDi.override(apiKubePatchInjectable, () => apiKubePatchMock);

      apiKubeGetMock = asyncFn();
      windowDi.override(apiKubeGetInjectable, () => apiKubeGetMock);
    });

    builder.afterWindowStart(() => {
      builder.allowKubeResource({
        apiName: "namespaces",
        group: "",
      });
    });
  });

  describe("when navigating to namespaces", () => {
    let rendered: RenderResult;
    let windowDi: DiContainer;

    beforeEach(async () => {
      rendered = await builder.render();

      windowDi = builder.applicationWindow.only.di;

      const navigateToNamespaces = windowDi.inject(navigateToNamespacesInjectable);
      const dockStore = windowDi.inject(dockStoreInjectable);

      navigateToNamespaces();

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
            expect(apiKubeGetMock).toHaveBeenCalledWith(
              "/apis/some-api-version/namespaces/some-uid",
            );
          });

          describe("when call for namespace resolves with namespace", () => {
            let someNamespaceData: KubeJsonApiData<BaseKubeJsonApiObjectMetadata<KubeObjectScope.Cluster>, unknown, unknown>;

            beforeEach(async () => {
              someNamespaceData = ({
                apiVersion: "some-api-version",
                kind: "Namespace",

                metadata: {
                  uid: "some-uid",
                  name: "some-name",
                  resourceVersion: "some-resource-version",
                  somePropertyToBeRemoved: "some-value",
                  somePropertyToBeChanged: "some-old-value",
                },
              });

              await apiKubeGetMock.resolve(someNamespaceData);
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
  somePropertyToBeRemoved: some-value
  somePropertyToBeChanged: some-old-value
  selfLink: /apis/some-api-version/namespaces/some-uid
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

              it("calls for save with just the adding version label", () => {
                expect(apiKubePatchMock).toHaveBeenCalledWith(
                  "/apis/some-api-version/namespaces/some-uid",
                  {
                    data: [{
                      op: "add",
                      path: "/metadata/labels",
                      value: {
                        "k8slens-edit-resource-version": "some-api-version",
                      },
                    }],
                  },
                  {
                    headers: {
                      "content-type": "application/json-patch+json",
                    },
                  },
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
                  await apiKubePatchMock.resolve({
                    kind: "Namespace",
                    metadata: {
                      name: "some-name",
                    },
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

              describe("when saving fails", () => {
                beforeEach(async () => {
                  await apiKubePatchMock.reject(new Error("some-error"));
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
                  await apiKubePatchMock.resolve({
                    kind: "Namespace",
                    metadata: {
                      name: "some-name",
                    },
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

              describe("when saving failings", () => {
                beforeEach(async () => {
                  await apiKubePatchMock.reject(new Error("some-error"));
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("does not close the dock tab", () => {
                  expect(
                    rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                  ).toBeInTheDocument();
                });
              });

              describe("when saving failings with a JsonApiError", () => {
                beforeEach(async () => {
                  await apiKubePatchMock.reject(new JsonApiErrorParsed(
                    {
                      kind: "Status",
                      apiVersion: "v1",
                      metadata: {},
                      status: "Failure",
                      message: "PodDisruptionBudget.policy \"frontend-pdb\" is invalid: spec.minAvailable: Invalid value: -10: must be greater than or equal to 0",
                      reason: "Invalid",
                      details: {
                        name: "frontend-pdb",
                        group: "policy",
                        kind: "PodDisruptionBudget",
                        causes: [
                          {
                            reason: "FieldValueInvalid",
                            message: "Invalid value: -10: must be greater than or equal to 0",
                            field: "spec.minAvailable",
                          },
                        ],
                      },
                      code: 422,
                    },
                    [
                      "PodDisruptionBudget.policy \"frontend-pdb\" is invalid: spec.minAvailable: Invalid value: -10: must be greater than or equal to 0",
                    ],
                  ));
                });

                it("renders", () => {
                  expect(rendered.baseElement).toMatchSnapshot();
                });

                it("does not close the dock tab", () => {
                  expect(
                    rendered.getByTestId("dock-tab-for-some-first-tab-id"),
                  ).toBeInTheDocument();
                });

                it("shows an error notification with a condensed message", () => {
                  expect(showErrorNotificationMock).toBeCalledWith(
                    <p>
                      {"Failed to save resource:"}
                      {" "}
                      {'PodDisruptionBudget.policy "frontend-pdb" is invalid: spec.minAvailable: Invalid value: -10: must be greater than or equal to 0'}
                    </p>,
                  );
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
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
  selfLink: /apis/some-api-version/namespaces/some-uid
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
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
  selfLink: /apis/some-api-version/namespaces/some-uid
`);
              });

              it("stores the changed configuration", async () => {
                const readJsonFile = windowDi.inject(
                  readJsonFileInjectable,
                );

                const actual = await readJsonFile(
                  "/some-directory-for-lens-local-storage/some-cluster-id.json",
                ) as Record<string, Record<string, unknown>>;

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
  somePropertyToBeRemoved: some-value
  somePropertyToBeChanged: some-old-value
  selfLink: /apis/some-api-version/namespaces/some-uid
`,
                  draft: `apiVersion: some-api-version
kind: Namespace
metadata:
  uid: some-uid
  name: some-name
  resourceVersion: some-resource-version
  somePropertyToBeChanged: some-changed-value
  someAddedProperty: some-new-value
  selfLink: /apis/some-api-version/namespaces/some-uid
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
                  expect(apiKubePatchMock).toHaveBeenCalledWith(
                    "/apis/some-api-version/namespaces/some-uid",
                    {
                      data: [
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
                          op: "add",
                          path: "/metadata/labels",
                          value: {
                            "k8slens-edit-resource-version": "some-api-version",
                          },
                        },
                        {
                          op: "replace",
                          path: "/metadata/somePropertyToBeChanged",
                          value: "some-changed-value",
                        },
                      ],
                    },
                    {
                      headers: {
                        "content-type": "application/json-patch+json",
                      },
                    },
                  );
                });

                it("given save resolves and another change in configuration, when saving, calls for save with changed configuration", async () => {
                  await apiKubePatchMock.resolve({
                    kind: "Namespace",
                    metadata: {
                      name: "some-name",
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


                  apiKubePatchMock.mockClear();

                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-first-tab-id",
                  );

                  fireEvent.click(saveButton);

                  expect(apiKubePatchMock).toHaveBeenCalledWith(
                    "/apis/some-api-version/namespaces/some-uid",
                    {
                      data: [
                        {
                          op: "add",
                          path: "/metadata/someOtherAddedProperty",
                          value: "some-other-new-value",
                        },
                      ],
                    },
                    {
                      headers: {
                        "content-type": "application/json-patch+json",
                      },
                    },
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
                apiKubeGetMock.mockClear();

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
                expect(apiKubeGetMock).toHaveBeenCalledWith(
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

                  await apiKubeGetMock.resolve(someOtherNamespace);
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

                it("when selecting to save, calls for save of second namespace with just the add edit version label", () => {
                  apiKubePatchMock.mockClear();

                  const saveButton = rendered.getByTestId(
                    "save-edit-resource-from-tab-for-some-second-tab-id",
                  );

                  fireEvent.click(saveButton);

                  expect(apiKubePatchMock).toHaveBeenCalledWith(
                    "/apis/some-api-version/namespaces/some-other-uid",
                    {
                      data: [{
                        op: "add",
                        path: "/metadata/labels",
                        value: {
                          "k8slens-edit-resource-version": "some-api-version",
                        },
                      }],
                    },
                    {
                      headers: {
                        "content-type": "application/json-patch+json",
                      },
                    },
                  );
                });

                describe("when clicking dock tab for the first namespace", () => {
                  beforeEach(() => {
                    apiKubeGetMock.mockClear();

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
                    expect(apiKubeGetMock).not.toHaveBeenCalledWith("/apis/some-api-version/namespaces/some-uid");
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
  somePropertyToBeRemoved: some-value
  somePropertyToBeChanged: some-old-value
  selfLink: /apis/some-api-version/namespaces/some-uid
`);
                  });

                  it("when selecting to save, calls for save of first namespace with just the new edit version label", () => {
                    apiKubePatchMock.mockClear();

                    const saveButton = rendered.getByTestId(
                      "save-edit-resource-from-tab-for-some-first-tab-id",
                    );

                    fireEvent.click(saveButton);

                    expect(apiKubePatchMock).toHaveBeenCalledWith(
                      "/apis/some-api-version/namespaces/some-uid",
                      {
                        data: [{
                          op: "add",
                          path: "/metadata/labels",
                          value: {
                            "k8slens-edit-resource-version": "some-api-version",
                          },
                        }],
                      },
                      {
                        headers: {
                          "content-type": "application/json-patch+json",
                        },
                      },
                    );
                  });
                });
              });
            });
          });

          describe("when call for namespace resolves with failure", () => {
            beforeEach(async () => {
              await apiKubeGetMock.reject(new Error("some-error-missing-namespace"));
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
