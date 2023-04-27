/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApiManager } from "../api-manager";
import type { IngressApi } from "../endpoints";
import { HorizontalPodAutoscalerApi } from "../endpoints";
import { Ingress } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import type { Fetch } from "../../fetch/fetch.injectable";
import fetchInjectable from "../../fetch/fetch.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { flushPromises } from "@k8slens/test-utils";
import setupAutoRegistrationInjectable from "../../../renderer/before-frame-starts/runnables/setup-auto-registration.injectable";
import { createMockResponseFromString } from "../../../test-utils/mock-responses";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import hostedClusterInjectable from "../../../renderer/cluster-frame-context/hosted-cluster.injectable";
import directoryForKubeConfigsInjectable from "../../app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import apiManagerInjectable from "../api-manager/manager.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import ingressApiInjectable from "../endpoints/ingress.api.injectable";
import loggerInjectable from "../../logger.injectable";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";
import { Cluster } from "../../cluster/cluster";

describe("KubeApi", () => {
  let fetchMock: AsyncFnMock<Fetch>;
  let apiManager: ApiManager;
  let di: DiContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting();

    fetchMock = asyncFn();
    di.override(fetchInjectable, () => fetchMock);

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    di.override(hostedClusterInjectable, () => new Cluster({
      contextName: "some-context-name",
      id: "some-cluster-id",
      kubeConfigPath: "/some-path-to-a-kubeconfig",
    }));

    apiManager = di.inject(apiManagerInjectable);

    const setupAutoRegistration = di.inject(setupAutoRegistrationInjectable);

    setupAutoRegistration.run();
  });

  describe("on first call to IngressApi.get()", () => {
    let ingressApi: IngressApi;
    let getCall: Promise<Ingress | null>;

    beforeEach(async () => {
      ingressApi = di.inject(ingressApiInjectable);
      getCall = ingressApi.get({
        name: "foo",
        namespace: "default",
      });

      // This is needed because of how JS promises work
      await flushPromises();
    });

    it("requests version list from the api group from the initial apiBase", () => {
      expect(fetchMock.mock.lastCall).toMatchObject([
        "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io",
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
          ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io"],
          createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io", JSON.stringify({
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
          "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when resource request fulfills with a resource", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1"],
            createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1", JSON.stringify({
              resources: [{
                name: "ingresses",
              }],
            })),
          );
        });

        it("makes the request to get the resource", () => {
          expect(fetchMock.mock.lastCall).toMatchObject([
            "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo",
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

        it("api is retrievable with the new apiBase", () => {
          expect(apiManager.getApi("/apis/networking.k8s.io/v1/ingresses")).toBeDefined();
        });

        describe("when the request resolves with no data", () => {
          let result: Ingress | null;

          beforeEach(async () => {
            await fetchMock.resolveSpecific(
              ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo"],
              createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo", JSON.stringify({})),
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
                "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1",
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
                  ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1"],
                  createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1", JSON.stringify({})),
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
              ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo"],
              createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo", JSON.stringify({
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
                "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1",
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
                  ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1"],
                  createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1/namespaces/default/ingresses/foo1", JSON.stringify({})),
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

      describe("when resource request fulfills with no resource", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1"],
            createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1", JSON.stringify({
              resources: [],
            })),
          );
        });

        it("requests resources from the second versioned api group from the initial apiBase", () => {
          expect(fetchMock.mock.lastCall).toMatchObject([
            "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1",
            {
              headers: {
                "content-type": "application/json",
              },
              method: "get",
            },
          ]);
        });



        describe("when resource request fulfills with a resource", () => {
          beforeEach(async () => {
            await fetchMock.resolveSpecific(
              ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1"],
              createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1", JSON.stringify({
                resources: [{
                  name: "ingresses",
                }],
              })),
            );
          });

          it("makes the request to get the resource", () => {
            expect(fetchMock.mock.lastCall).toMatchObject([
              "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo",
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

          it("api is retrievable with the new apiBase", () => {
            expect(apiManager.getApi("/apis/networking.k8s.io/v1beta1/ingresses")).toBeDefined();
          });

          it("api is retrievable with the old apiBase", () => {
            expect(apiManager.getApi("/apis/networking.k8s.io/v1/ingresses")).toBeDefined();
          });

          describe("when the request resolves with no data", () => {
            let result: Ingress | null;

            beforeEach(async () => {
              await fetchMock.resolveSpecific(
                ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({})),
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
                  "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1",
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
                    ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
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
                ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({
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
                  "https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1",
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
                    ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
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
          ["https://127.0.0.1:12345/api-kube/apis/networking.k8s.io"],
          createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/networking.k8s.io", JSON.stringify({
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
          "https://127.0.0.1:12345/api-kube/apis/extensions",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });

      describe("when resource request fulfills with a resource", () => {
        beforeEach(async () => {
          await fetchMock.resolveSpecific(
            ["https://127.0.0.1:12345/api-kube/apis/extensions"],
            createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/extensions", JSON.stringify({
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
            "https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1",
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
              ["https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1"],
              createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/extensions", JSON.stringify({
                resources: [{
                  name: "ingresses",
                }],
              })),
            );
          });

          it("makes the request to get the resource", () => {
            expect(fetchMock.mock.lastCall).toMatchObject([
              "https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo",
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

          it("api is retrievable with the new apiBase", () => {
            expect(apiManager.getApi("/apis/extensions/v1beta1/ingresses")).toBeDefined();
          });

          describe("when the request resolves with no data", () => {
            let result: Ingress | null;

            beforeEach(async () => {
              await fetchMock.resolveSpecific(
                ["https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({})),
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
                  "https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1",
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
                    ["https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
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
                ["https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo"],
                createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo", JSON.stringify({
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
                  "https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1",
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
                    ["https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1"],
                    createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/extensions/v1beta1/namespaces/default/ingresses/foo1", JSON.stringify({})),
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

  describe("on first call to HorizontalPodAutoscalerApi.get()", () => {
    let horizontalPodAutoscalerApi: HorizontalPodAutoscalerApi;

    beforeEach(async () => {
      horizontalPodAutoscalerApi = new HorizontalPodAutoscalerApi({
        logger: di.inject(loggerInjectable),
        maybeKubeApi: di.inject(maybeKubeApiInjectable),
      }, {
        allowedUsableVersions: {
          autoscaling: [
            "v2",
            "v2beta2",
            "v2beta1",
            "v1",
          ],
        },
      });
      horizontalPodAutoscalerApi.get({
        name: "foo",
        namespace: "default",
      });

      // This is needed because of how JS promises work
      await flushPromises();
    });

    it("requests version list from the api group from the initial apiBase", () => {
      expect(fetchMock.mock.lastCall).toMatchObject([
        "https://127.0.0.1:12345/api-kube/apis/autoscaling",
        {
          headers: {
            "content-type": "application/json",
          },
          method: "get",
        },
      ]);
    });

    describe("when the version list from the api group resolves with preferredVersion in allowed version", () => {
      beforeEach(async () => {
        await fetchMock.resolveSpecific(
          ["https://127.0.0.1:12345/api-kube/apis/autoscaling"],
          createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/autoscaling", JSON.stringify({
            apiVersion: "v1",
            kind: "APIGroup",
            name: "autoscaling",
            versions: [
              {
                groupVersion: "autoscaling/v1",
                version: "v1",
              },
              {
                groupVersion: "autoscaling/v1beta1",
                version: "v2beta1",
              },
            ],
            preferredVersion: {
              groupVersion: "autoscaling/v1",
              version: "v1",
            },
          })),
        );
      });

      it("requests resources from the preferred version api group from the initial apiBase", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "https://127.0.0.1:12345/api-kube/apis/autoscaling/v1",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });
    });

    describe("when the version list from the api group resolves with preferredVersion not allowed version", () => {
      beforeEach(async () => {
        await fetchMock.resolveSpecific(
          ["https://127.0.0.1:12345/api-kube/apis/autoscaling"],
          createMockResponseFromString("https://127.0.0.1:12345/api-kube/apis/autoscaling", JSON.stringify({
            apiVersion: "v1",
            kind: "APIGroup",
            name: "autoscaling",
            versions: [
              {
                groupVersion: "autoscaling/v2",
                version: "v2",
              },
              {
                groupVersion: "autoscaling/v2beta1",
                version: "v2beta1",
              },
              {
                groupVersion: "autoscaling/v3",
                version: "v3",
              },
            ],
            preferredVersion: {
              groupVersion: "autoscaling/v3",
              version: "v3",
            },
          })),
        );
      });

      it("requests resources from the non preferred version from the initial apiBase", () => {
        expect(fetchMock.mock.lastCall).toMatchObject([
          "https://127.0.0.1:12345/api-kube/apis/autoscaling/v2",
          {
            headers: {
              "content-type": "application/json",
            },
            method: "get",
          },
        ]);
      });
    });
  });
});
