import { KubeApi, IKubeApiLinkBase } from "../kube-api";

interface ParseAPITest {
    url: string;
    expected: IKubeApiLinkBase;
}

const tests: ParseAPITest[] = [
  {
    url: "/api/v1/namespaces/kube-system/pods/coredns-6955765f44-v8p27",
    expected: {
      apiBase: "/api/v1/pods",
      apiPrefix: "/api",
      apiGroup: "",
      apiVersion: "v1",
      apiVersionWithGroup: "v1",
      namespace: "kube-system",
      resource: "pods",
      name: "coredns-6955765f44-v8p27"
    },
  },
  {
    url: "/apis/stable.example.com/foo1/crontabs",
    expected: {
      apiBase: "/apis/stable.example.com/foo1/crontabs",
      apiPrefix: "/apis",
      apiGroup: "stable.example.com",
      apiVersion: "foo1",
      apiVersionWithGroup: "stable.example.com/foo1",
      resource: "crontabs",
      name: undefined,
      namespace: undefined,
    },
  },
  {
    url: "/apis/cluster.k8s.io/v1alpha1/clusters",
    expected: {
      apiBase: "/apis/cluster.k8s.io/v1alpha1/clusters",
      apiPrefix: "/apis",
      apiGroup: "cluster.k8s.io",
      apiVersion: "v1alpha1",
      apiVersionWithGroup: "cluster.k8s.io/v1alpha1",
      resource: "clusters",
      name: undefined,
      namespace: undefined,
    },
  },
  {
    url: "/api/v1/namespaces",
    expected: {
      apiBase: "/api/v1/namespaces",
      apiPrefix: "/api",
      apiGroup: "",
      apiVersion: "v1",
      apiVersionWithGroup: "v1",
      resource: "namespaces",
      name: undefined,
      namespace: undefined,
    },
  },
  {
    url: "/api/v1/secrets",
    expected: {
      apiBase: "/api/v1/secrets",
      apiPrefix: "/api",
      apiGroup: "",
      apiVersion: "v1",
      apiVersionWithGroup: "v1",
      resource: "secrets",
      name: undefined,
      namespace: undefined,
    },
  },
  {
    url: "/api/v1/nodes/minikube",
    expected: {
      apiBase: "/api/v1/nodes",
      apiPrefix: "/api",
      apiGroup: "",
      apiVersion: "v1",
      apiVersionWithGroup: "v1",
      resource: "nodes",
      name: "minikube",
      namespace: undefined,
    },
  },
  {
    url: "/api/foo-bar/nodes/minikube",
    expected: {
      apiBase: "/api/foo-bar/nodes",
      apiPrefix: "/api",
      apiGroup: "",
      apiVersion: "foo-bar",
      apiVersionWithGroup: "foo-bar",
      resource: "nodes",
      name: "minikube",
      namespace: undefined,
    },
  },
];

jest.mock('../kube-watch-api.ts', () => 'KubeWatchApi');
describe("parseApi unit tests", () => {
  for (const i in tests) {
    const { url: tUrl, expected:tExpect} = tests[i];
    test(`test #${parseInt(i)+1}`, () => {
      expect(KubeApi.parseApi(tUrl)).toStrictEqual(tExpect);
    });
  }
});