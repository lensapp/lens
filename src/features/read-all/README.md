# Read All ClusterRole

The read all cluster role found in cluster-role.yaml can be bound to service accounts used  with Lens. Service Accounts with this cluster role will be able to see cluster metrics and pod metrics but will not be able to see secrets and service accounts. The cluster role does not allow for modifying K8s resources (update, create or delete). It also explicitly lists Kubernetes' little-known sub-resources (which is why the base `view` cluster role cannot see metrics).

This is ideal for giving particular users access to the a read only user to use in Lens or for dashboards left up in the office.

