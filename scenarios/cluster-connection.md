# Cluster Connection

## Current Flow for local cluster

1. A kubeconfig file is discovered by the "kubeconfig sync"
1. The kubeconfig file is read and verified to have a correctly shaped `context`, `cluster`, and `user` entries
1. The user clicks on the cluster icon in the catalog
1. The renderer is navigated to `/cluster/<cluster-id>`
1. The user is shown a list of connection updates
1. A new iframe is initialized for that specific cluster using the cluster ID as part of the src field as a means of communication into the iframe about which cluster the iframe is for
1. Then the cluster is requested to be "activated" on main
1. Activation is as follows:
    1. Bind intervals to refresh connection status, accessibility, and metadata
    1. Bind reactions to update prometheus settings when the user changes them on the front end
    1. Bind reaction to recreate the proxy kubeconfig when the user changes the default namespace setting
    1. The KubeAuthProxy (spawns a k8s-lens-proxy instance) server is started and the flow waits for the server to report back the port it is using over STDOUT and also waits for that port to become used as reported by the OS
    1. The connection status is checked by "detecting the cluster version"
        1. By making a request to the Lens Proxy using the cluster id and the `/version` pathname
        1. Lens Proxy receives the request with a pathname of `/<cluster-id>/version`
        1. It detects and extracts the `cluster-id` and finds the relevant `Cluster` for that ID while modifying the `pathname` to be `/api-kube/version`
        1. It detects that the pathname starts with `/api-kube` and removes that modification
        1. It ensures that the proxy server is running and gets a proxy target to that local server
        1. It then proxies the rest of the request to that proxy
        1. The k8s-lens-proxy instance for that cluster then proxies the request to the kubelet
        1. The kubelet then returns an HTTP 200 responds with a JSON body containing the field `version`
    1. If the version is detected the cluster is marked as "accessible"
    1. The user still sees the list of connection updates
    1. Then the accessibility of the cluster is refreshed as follows:
          1. A kubeconfig pointing to the k8s-lens-proxy instance is loaded
          1. Check if the user for the kube context for this cluster ("kube user") has permissions to create all resources in the `kube-system` namespace (checking for admin permissions)
          1. Check if the kube user has permissions to watch all resources (checking for global watch permissions)
          1. Request all namespaces for this cluster as follows:
              1. If the user has any configured "accessible namespaces" use those
              1. Try and do a GET request for `/api/v1/namespace`
              1. If that succeeds use that list
              1. If it fails and the user has a "default namespace" configured in the kubeconfig file use that
              1. Otherwise fall back to an empty list
              1. Request all kube api resources descriptors as follows:
              1. Request legacy kube resources descriptors from `/api`
              1. Request new groups of kube resources from `/apis`
              1. For all the groups request the kube resources descriptors under them
          1. If the attempt to list kube api resources fails but a previous attempt succeeded continue to use the old list
          1. Using the list of namespaces retrieved above and the current list of kube api resource descriptors check which resources the user has LIST permissions for across at least one namespace as follows:
              1. Do a `SelfSubjectRulesReview` for each namespace
              1. Compute from that result if the kube user definitely doesn't have LIST permissions for each resource in that namespace.
          1. If at least one resource is known to be LIST-able we set the cluster to be "ready"
1. Once the cluster is "ready" the iframe is made visible
