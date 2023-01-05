/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeJsonApi } from "../kube-json-api";
import type { ApiManager } from "../api-manager";
import { Ingress, IngressApi } from "../endpoints";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import apiManagerInjectable from "../api-manager/manager.injectable";
import type { Fetch } from "../../fetch/fetch.injectable";
import fetchInjectable from "../../fetch/fetch.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "../../test-utils/flush-promises";
import createKubeJsonApiInjectable from "../create-kube-json-api.injectable";
import setupAutoRegistrationInjectable from "../../../renderer/before-frame-starts/runnables/setup-auto-registration.injectable";
import { createMockResponseFromString } from "../../../test-utils/mock-responses";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import createClusterInjectable from "../../../main/create-cluster/create-cluster.injectable";
import hostedClusterInjectable from "../../../renderer/cluster-frame-context/hosted-cluster.injectable";
import directoryForKubeConfigsInjectable from "../../app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";

describe("KubeApi", () => {
  let request: KubeJsonApi;
  let registerApiSpy: jest.SpiedFunction<ApiManager["registerApi"]>;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    const createCluster = di.inject(createClusterInjectable);

    di.override(hostedClusterInjectable, () => createCluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }, {
      clusterServerUrl: "https://localhost:8080",
    }));

    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);

    request = createKubeJsonApi({
      serverAddress: `http://127.0.0.1:9999`,
      apiBase: "/api-kube",
    });
    registerApiSpy = jest.spyOn(di.inject(apiManagerInjectable), "registerApi");

    const setupAutoRegistration = di.inject(setupAutoRegistrationInjectable);

    setupAutoRegistration.run();
  });

  describe("on first call to IngressApi.get()", () => {
    let ingressApi: IngressApi;
    let getCall: Promise<Ingress | null>;

    beforeEach(async () => {
      ingressApi = new IngressApi({
        request,
        objectConstructor: Ingress,
        apiBase: "/apis/networking.k8s.io/v1/ingresses",
        fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
        checkPreferredVersion: true,
      });
      getCall = ingressApi.get({
        name: "foo",
        namespace: "default",
      });

      // This is needed because of how JS promises work
      await flushPromises();
    });

    it("requests version list from the api group from the initial apiBase", () => {
      expect(fetchMock.mock.lastCall).toMatchObject([
        "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io",
        {
          headers: {
            "content-type": "application/json",
          },
          method: "get",
        },
      ]);
    });

    describe("when the version list from the api group resolves", () => {
      beforeEach(async () => {
        await fetchMock.resolveSpecific(
          ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io"],
          createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io", JSON.stringify({
            apiVersion: "v1",
            kind: "APIGroup",
            name: "networking.k8s.io",
            versions: [
              {
                groupVersion: "networking.k8s.io/v1",
                version: "v1",
              },
              {
                groupVersion: "networking.k8s.io/v1beta1",
                version: "v1beta1",
              },
            ],
            preferredVersion: {
              groupVersion: "networking.k8s.io/v1",
              version: "v1",
            },
          })),
        );
      });

      it("requests resources from the versioned api group from the initial apiBase", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when resource request fufills with a resource", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1", JSON.stringify({
              resources: [{
                name: "ingresses",
              }],
            })),
          );
        });

        it("makes the request to get the resource", () => {
          expect(fetchMock.mock.lastCall).toMatchObject([
            "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo",
            {
              headers: {
                "content-type": "application/json",
              },
              method: "get",
            },
          ]);
        });

        it("sets fields in the api instance", () => {
          expect(ingressApi).toEqual(expect.objectContaining({
            apiVersionPreferred: "v1",
            apiPrefix: "/apis",
            apiGroup: "networking.k8s.io",
          }));
        });

        it("registers the api with the changes info", () => {
          expect(registerApiSpy).toBeCalledWith(ingressApi);
        });

        describe("when the request resolves with no data", () => {
          let result: Ingress | null;

          beforeEach(async () => {
            await fetchMock.resolveSpecific(
              ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo"],
              createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo", JSON.stringify({})),
            );
            result = await getCall;
          });

          it("results in the get call resolving to null", () => {
            expect(result).toBeNull();
          });

          describe("on the second call to IngressApi.get()", () => {
            let getCall: Promise<Ingress | null>;

            beforeEach(async () => {
              getCall = ingressApi.get({
                name: "foo1",
                namespace: "default",
              });

              // This is needed because of how JS promises work
              await flushPromises();
            });

            it("makes the request to get the resource", () => {
              expect(fetchMock.mock.lastCall).toMatchObject([
                "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1",
                {
                  headers: {
                    "content-type": "application/json",
                  },
                  method: "get",
                },
              ]);
            });

            describe("when the request resolves with no data", () => {
              let result: Ingress | null;

              beforeEach(async () => {
                await fetchMock.resolveSpecific(
                  ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1"],
                  createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1", JSON.stringify({})),
                );
                result = await getCall;
              });

              it("results in the get call resolving to null", () => {
                expect(result).toBeNull();
              });
            });
          });
        });

        describe("when the request resolves with data", () => {
          let result: Ingress | null;

          beforeEach(async () => {
            await fetchMock.resolveSpecific(
              ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo"],
              createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo", JSON.stringify({
                apiVersion: "v1",
                kind: "Ingress",
                metadata: {
                  name: "foo",
                  namespace: "default",
                  resourceVersion: "1",
                  uid: "12345",
                },
              })),
            );
            result = await getCall;
          });

          it("results in the get call resolving to an instance", () => {
            expect(result).toBeInstanceOf(Ingress);
          });

          describe("on the second call to IngressApi.get()", () => {
            let getCall: Promise<Ingress | null>;

            beforeEach(async () => {
              getCall = ingressApi.get({
                name: "foo1",
                namespace: "default",
              });

              // This is needed because of how JS promises work
              await flushPromises();
            });

            it("makes the request to get the resource", () => {
              expect(fetchMock.mock.lastCall).toMatchObject([
                "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1",
                {
                  headers: {
                    "content-type": "application/json",
                  },
                  method: "get",
                },
              ]);
            });

            describe("when the request resolves with no data", () => {
              let result: Ingress | null;

              beforeEach(async () => {
                await fetchMock.resolveSpecific(
                  ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1"],
                  createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1", JSON.stringify({})),
                );
                result = await getCall;
              });

              it("results in the get call resolving to null", () => {
                expect(result).toBeNull();
              });
            });
          });
        });
      });

      describe("when resource request fufills with no resource", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1", JSON.stringify({
              resources: [],
            })),
          );
        });

        it("requests resources from the second versioned api group from the initial apiBase", () => {
          expect(fetchMock.mock.lastCall).toMatchObject([
            "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1",
            {
              headers: {
                "content-type": "application/json",
              },
              method: "get",
            },
          ]);
        });



        describe("when resource request fufills with a resource", () => {
          beforeEach(async () => {
            await fetchMock.resolveSpecific(
              ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1"],
              createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1", JSON.stringify({
                resources: [{
                  name: "ingresses",
                }],
              })),
            );
          });

          it("makes the request to get the resource", () => {
            expect(fetchMock.mock.lastCall).toMatchObject([
              "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo",
              {
                headers: {
                  "content-type": "application/json",
                },
                method: "get",
              },
            ]);
          });

          it("sets fields in the api instance", () => {
            expect(ingressApi).toEqual(expect.objectContaining({
              apiVersionPreferred: "v1beta1",
              apiPrefix: "/apis",
              apiGroup: "networking.k8s.io",
            }));
          });

          it("registers the api with the changes info", () => {
            expect(registerApiSpy).toBeCalledWith(ingressApi);
          });

          describe("when the request resolves with no data", () => {
            let result: Ingress | null;

            beforeEach(async () => {
              await fetchMock.resolveSpecific(
                ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({})),
              );
              result = await getCall;
            });

            it("results in the get call resolving to null", () => {
              expect(result).toBeNull();
            });

            describe("on the second call to IngressApi.get()", () => {
              let getCall: Promise<Ingress | null>;

              beforeEach(async () => {
                getCall = ingressApi.get({
                  name: "foo1",
                  namespace: "default",
                });

                // This is needed because of how JS promises work
                await flushPromises();
              });

              it("makes the request to get the resource", () => {
                expect(fetchMock.mock.lastCall).toMatchObject([
                  "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1",
                  {
                    headers: {
                      "content-type": "application/json",
                    },
                    method: "get",
                  },
                ]);
              });

              describe("when the request resolves with no data", () => {
                let result: Ingress | null;

                beforeEach(async () => {
                  await fetchMock.resolveSpecific(
                    ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
                  );
                  result = await getCall;
                });

                it("results in the get call resolving to null", () => {
                  expect(result).toBeNull();
                });
              });
            });
          });

          describe("when the request resolves with data", () => {
            let result: Ingress | null;

            beforeEach(async () => {
              await fetchMock.resolveSpecific(
                ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({
                  apiVersion: "v1",
                  kind: "Ingress",
                  metadata: {
                    name: "foo",
                    namespace: "default",
                    resourceVersion: "1",
                    uid: "12345",
                  },
                })),
              );
              result = await getCall;
            });

            it("results in the get call resolving to an instance", () => {
              expect(result).toBeInstanceOf(Ingress);
            });

            describe("on the second call to IngressApi.get()", () => {
              let getCall: Promise<Ingress | null>;

              beforeEach(async () => {
                getCall = ingressApi.get({
                  name: "foo1",
                  namespace: "default",
                });

                // This is needed because of how JS promises work
                await flushPromises();
              });

              it("makes the request to get the resource", () => {
                expect(fetchMock.mock.lastCall).toMatchObject([
                  "http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1",
                  {
                    headers: {
                      "content-type": "application/json",
                    },
                    method: "get",
                  },
                ]);
              });

              describe("when the request resolves with no data", () => {
                let result: Ingress | null;

                beforeEach(async () => {
                  await fetchMock.resolveSpecific(
                    ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
                  );
                  result = await getCall;
                });

                it("results in the get call resolving to null", () => {
                  expect(result).toBeNull();
                });
              });
            });
          });
        });
      });
    });

    describe("when the version list from the api group resolves with no versions", () => {
      beforeEach(async () => {
        await fetchMock.resolveSpecific(
          ["http://127.0.0.1:9999/api-kube/apis/networking.k8s.io"],
          createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/networking.k8s.io", JSON.stringify({
            "metadata": {},
            "status": "Failure",
            "message": "the server could not find the requested resource",
            "reason": "NotFound",
            "details": {
              "causes": [
                {
                  "reason": "UnexpectedServerResponse",
                  "message": "404 page not found",
                },
              ],
            },
            "code": 404,
          }), 404),
        );
      });

      it("requests the resources from the base api url from the fallback api", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "http://127.0.0.1:9999/api-kube/apis/extensions",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when resource request fufills with a resource", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["http://127.0.0.1:9999/api-kube/apis/extensions"],
            createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/extensions", JSON.stringify({
              apiVersion: "v1",
              kind: "APIGroup",
              name: "extensions",
              versions: [
                {
                  groupVersion: "extensions/v1beta1",
                  version: "v1beta1",
                },
              ],
              preferredVersion: {
                groupVersion: "extensions/v1beta1",
                version: "v1beta1",
              },
            })),
          );
        });

        it("requests resource versions from the versioned api group from the fallback apiBase", () => {
          expect(fetchMock.mock.lastCall).toMatchObject([
            "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1",
            {
              headers: {
                "content-type": "application/json",
              },
              method: "get",
            },
          ]);
        });

        describe("when the preferred version request resolves to v1beta1", () => {
          beforeEach(async () => {
            await fetchMock.resolveSpecific(
              ["http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1"],
              createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/extensions", JSON.stringify({
                resources: [{
                  name: "ingresses",
                }],
              })),
            );
          });

          it("makes the request to get the resource", () => {
            expect(fetchMock.mock.lastCall).toMatchObject([
              "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo",
              {
                headers: {
                  "content-type": "application/json",
                },
                method: "get",
              },
            ]);
          });

          it("sets fields in the api instance", () => {
            expect(ingressApi).toEqual(expect.objectContaining({
              apiVersionPreferred: "v1beta1",
              apiPrefix: "/apis",
              apiGroup: "extensions",
            }));
          });

          it("registers the api with the changes info", () => {
            expect(registerApiSpy).toBeCalledWith(ingressApi);
          });

          describe("when the request resolves with no data", () => {
            let result: Ingress | null;

            beforeEach(async () => {
              await fetchMock.resolveSpecific(
                ["http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({})),
              );
              result = await getCall;
            });

            it("results in the get call resolving to null", () => {
              expect(result).toBeNull();
            });

            describe("on the second call to IngressApi.get()", () => {
              let getCall: Promise<Ingress | null>;

              beforeEach(async () => {
                getCall = ingressApi.get({
                  name: "foo1",
                  namespace: "default",
                });

                // This is needed because of how JS promises work
                await flushPromises();
              });

              it("makes the request to get the resource", () => {
                expect(fetchMock.mock.lastCall).toMatchObject([
                  "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1",
                  {
                    headers: {
                      "content-type": "application/json",
                    },
                    method: "get",
                  },
                ]);
              });

              describe("when the request resolves with no data", () => {
                let result: Ingress | null;

                beforeEach(async () => {
                  await fetchMock.resolveSpecific(
                    ["http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
                  );
                  result = await getCall;
                });

                it("results in the get call resolving to null", () => {
                  expect(result).toBeNull();
                });
              });
            });
          });

          describe("when the request resolves with data", () => {
            let result: Ingress | null;

            beforeEach(async () => {
              await fetchMock.resolveSpecific(
                ["http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({
                  apiVersion: "v1beta1",
                  kind: "Ingress",
                  metadata: {
                    name: "foo",
                    namespace: "default",
                    resourceVersion: "1",
                    uid: "12345",
                  },
                })),
              );
              result = await getCall;
            });

            it("results in the get call resolving to an instance", () => {
              expect(result).toBeInstanceOf(Ingress);
            });

            describe("on the second call to IngressApi.get()", () => {
              let getCall: Promise<Ingress | null>;

              beforeEach(async () => {
                getCall = ingressApi.get({
                  name: "foo1",
                  namespace: "default",
                });

                // This is needed because of how JS promises work
                await flushPromises();
              });

              it("makes the request to get the resource", () => {
                expect(fetchMock.mock.lastCall).toMatchObject([
                  "http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1",
                  {
                    headers: {
                      "content-type": "application/json",
                    },
                    method: "get",
                  },
                ]);
              });

              describe("when the request resolves with no data", () => {
                let result: Ingress | null;

                beforeEach(async () => {
                  await fetchMock.resolveSpecific(
                    ["http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("http://127.0.0.1:9999/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
                  );
                  result = await getCall;
                });

                it("results in the get call resolving to null", () => {
                  expect(result).toBeNull();
                });
              });
            });
          });
        });
      });
    });
  });
});
