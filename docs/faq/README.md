# FAQ

### What operating systems does Lens support?

Lens supports MacOS, Windows and Linux operating systems. For Linux there are Snap and AppImage versions. For MacOS there are DMG and Homebrew options.

### Lens application is not opening, what might be wrong?

When Lens is started, it will start HTTP proxy server on the background and requires that operating system allows to start listening to some free port. You can see the port allocated for Lens from application logs. Lens expects also that `localhost` DNS points to `127.0.0.1` address.

### Why can't I add any clusters?

When adding new clusters, a valid Kubeconfig file is required. Please check that all contexts present in Kubeconfig file are valid.

### Why Cluster dashboard is not opening?

To see Cluster dashboard properly, Kubernetes cluster must be reachable either directly from your computer or via HTTP proxy. You can configure HTTP proxy in Cluster Settigns. Also, provided credentials in Kubeconfig must be valid. If Kubeconfig uses `exec` command, the binary must be available in global PATH or absolute path must be used. Lens application can't see PATH modifications made by any shell init scripts. There might be also some issues on the Snap version if the exec binary is installed also from Snap and requires additional symlinking, please see [#699](https://github.com/lensapp/lens/issues/699).

### Why I don't see anything on Cluster dashboard?

Users will see on Cluster dashboard only those resources that they are allowed to see (RBAC). Lens requires that user has access at least to one namespace. Lens tries first fetch namespaces from Kubernetes API. If user is not allowed to list namespaces, allowed namespaces can be configured in Cluster settings or in Kubeconfig.

### Why I don't see any metrics or some of the metrics are not working?

In order to display cluster metrics, Lens requires that Prometheus is running in the cluster. You can install Prometheus in Cluster settings if needed.

Lens tries to detect Prometheus installation automatically. If it fails to detect the installation properly, you can configure Prometheus service address in Cluster settings. If some of the metrics are not displayed correctly, you can see queries that Lens is using [here](https://github.com/lensapp/lens/tree/master/src/main/prometheus) and adapt your prometheus configuration to support those queries. Please refer [Prometheus documentation](https://prometheus.io/docs/prometheus/latest/configuration/configuration/) or your Prometheus installer documentation how to do this.

### Kubectl is not working in Lens terminal, what should I do?

Lens tries to download correct Kubectl version for the cluster and use that in Lens terminal. Some operating systems (namely Windows) might have restrictions set that prevent downloading and executing binaries from the default location that Lens is using. You can change the directory where Lens downloads the binaries in App Preferences. It's also possible to change the Download mirror to use Azure if default Google is not reachable from your network. If downloading Kubectl is not option for you, you can define path to pre-installed Kubectl on your machine and Lens will use that binary instead.

### How can I configure Helm repositories?

Lens comes with bundled Helm 3 binary and Lens will add by default `bitnami` repository if no other repositories are configured. You can add more repositories from Artifact HUB in App preferences. At this moment it is not possible to add private repositories. Those and other public repositories can be added manually via command line.

### Where can I find application logs?

Lens will store application logs to following locations depending on your operating system:
- MacOS: ~/Library/Logs/Lens/
- Windows: %USERPROFILE%\AppData\Roaming\Lens\logs\
- Linux: ~/.config/Lens/logs/

### How can I see more verbose logs?

You can start Lens application on debug mode from the command line to see more verbose logs. To start application on debug mode, please provide `DEBUG=true` environment variable and before starting the application, for example: `DEBUG=TRUE /Applications/Lens.app/Contents/MacOS/Lens`

### Why Lens window rendering is broken?

MacOS users can encouter visual bug with fuzzy lines appeared while [connected to external 4K display](https://www.forbes.com/sites/gordonkelly/2020/06/11/apple-macos-macbook-pro-google-chrome-display-problem/?sh=331ac27967b4). Same thing can happen with any of Electron applications or Chrome itself.

![fuzzy lines](https://user-images.githubusercontent.com/4453/78537270-80cc8e80-77ef-11ea-8a6e-0bc69cc28abe.png "Fuzzy lines on MacOS")

As a temporary workaround there is a possibility to disable Chromium GPU acceleration. To do this for Lens, you need to provide `LENS_DISABLE_GPU=true` env variable and relaunch app.

First, open `.bash_profile` file from your terminal

```
open -a TextEdit.app ~/.bash_profile
```

Then, add this line

```
export LENS_DISABLE_GPU=true
```