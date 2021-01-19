# Adding Clusters

Add clusters by clicking the **Add Cluster** button in the left-side menu.

1. Click the **Add Cluster** button (indicated with a '+' icon).
2. Enter the path to your kubeconfig file. You'll need to have a kubeconfig file for the cluster you want to add. You can either browse for the path from the file system or or enter it directly.

Selected [cluster contexts](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#context) are added as a separate item in the left-side cluster menu to allow you to operate easily on multiple clusters and/or contexts.

**NOTE**: Any cluster that you added manually will not be merged into your kubeconfig file.

![Add Cluster](images/add-cluster.png)

For more information on kubeconfig see [Kubernetes docs](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).

To see your currently-enabled config with `kubectl`, enter `kubectl config view --minify --raw` in your terminal.

When connecting to a cluster, make sure you have a valid and working kubeconfig for the cluster. Following lists known "gotchas" in some authentication types used in kubeconfig with Lens app.

## Exec auth plugins

When using [exec auth](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#configuration) plugins make sure the paths that are used to call any binaries are full paths as Lens app might not be able to call binaries with relative paths. Make also sure that you pass all needed information either as arguments or env variables in the config, Lens app might not have all login shell env variables set automatically.
