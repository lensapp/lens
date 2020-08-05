# Read All ClusterRole

The read all cluster role found in cluster-role.yaml can be bound to service accounts used  with Lens. Service Accounts with this cluster role will be able to see cluster metrics and pod metrics but will not be able to see secrets and service accounts. The cluster role does not allow for modifying K8s resources (update, create or delete). It also explicitly lists Kubernetes' little-known sub-resources (which is why service accounts bound to the base `view` cluster role cannot see metrics in Lens).

This is ideal for giving particular users access to a read only user to use in Lens or for dashboards left up in the office.

To use the cluster role bind it to a service account. In the example below we give read all access to the service account called `developer`.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: developer-read-all
subjects:
- kind: ServiceAccount
  name: developer
  namespace: default
roleRef:
  kind: ClusterRole
  name: read-all-clusterrole
  apiGroup: rbac.authorization.k8s.io
```
