# Cluster Settings

It is easy to configure Lens Clusters to your liking through its various settings. By right-clicking the cluster of choice you can open `Settings`.

## Status

An overview of the cluster status.

### Cluster Status

This section provides cluster details including the detected distribution, kernel version, API endpoint and online status.

## General

General information for the cluster with some settings that can be customized.

### Cluster Name

The cluster name is inheritated from the kubeconfig by default. You can change the cluster name to another value by updating here. Note this does not update your kubeconfig file.

### Workspace

This is the Lens Workspace that the cluster is associated with. You can change to another workspace or create a new workspace - this option will take you the Workspaces editor where you can create a new workspace and then
navigate back to the cluster settings.

### Cluster Icon

A random cluster icon is associated with your cluster when it is first created. You can define your own cluster icon here.

### HTTP Proxy

If you need to use a HTTP proxy to communicate with the Kubernetes API you can define it here.

### Prometheus

Lens can be configured to query a Prometheus server that is installed in the cluster. The query format used can be configured here to either auto-detect or a pre-configured query format. The available formats are:

* Lens
* Helm Operator
* Prometheus Operator
* Stacklight

For more details of custom Prometheus configurations refer to this [guide](https://github.com/lensapp/lens/blob/master/troubleshooting/custom-prometheus.md).

### Working Directory

The terminat working directory can be configured here - by default it is set to `$HOME`.

## Features

Additional Lens features that can be installed by the user.

## Removal

Remove the current cluster.
