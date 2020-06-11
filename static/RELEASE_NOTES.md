# What's new?

Here you can find description of changes we've built into each release. While we try our best to make each upgrade automatic and as smooth as possible, there may be some cases where your might need to do something to ensure the application works smoothly. So please read through the release highlights!

## 3.5.0-rc.1 (current version)

- Dynamic dashboard UI based on RBAC rules
- Show object reference for all objects
- Unify scrollbars/paddings
- New logo
- Remove Helm release update checker
- Improve Helm release version detection
- Fix: add arch node selector for hybrid clusters
- Fix pod shell command on Windows
- Fix: kill shell process by pid on Windows
- Fix: close proxy server on app quit
- Translation correction: transit to transmit
- Remove Kontena reference from Lens logo
- Track telemetry pref changed event
- Integration tests using spectron

## 3.4.0

- Auto-detect Prometheus installation
- Allow to select Prometheus query style
- Show node events in node details
- Enable code folding in resource editor
- Improve dashboard reload
- Provide link to configMap from pod details
- Show system roles on Roles page
- Terminal dock tab improvements
- Fix port availability test
- Fix EndpointSubset.toString() to work without ports
- Return empty string if Helm release version is not detected
- Delay webview create on cluster page
- Fix no-drag css
- Fix node shell session regression
- Rebuild locales & fix translation bugs
- Show always Events title in resource details
- Fix missing spaces in container command
- Check also beta.kubernetes.io/os selector for windows pod shell
- Cache terminall shell env
- Cleanup cluster webview loading
- Update metrics feature components
- Update dashboard npm packages

## 3.3.1

- Do not timeout watch requests
- Fix pod shell error if no access to nodes
- Fix list sort by age
- Always refresh stores when object list is mounted
- Update @kubernetes/client-node to 0.11.1

## 3.3.0

- New section: endpoints
- Initial port-forward implementation for services
- Hide object-list applied filters by default
- Display emptyDir medium and size limit
- Show pod terminating status
- Fix default workspace remove
- Fix issues with crd plugins
- Fix use of bundled kubectl
- Clean up legacy references to Kontena
- Fix jobs sorting if condition is empty
- Electron 6.1.10

## 3.2.0

- Render colors in logs
- Add kubectl download mirror select to preferences
- Bundle helm3 binary
- Catch ipc errors on proxy exit
- SelfSubjectAccessReview use 'pods' resource
- Send Content-Type header on response for asset request
- Fix Helm chart version comparison
- Don't close namespace menu on select
- Change terminal fit-to-window icon
- Silence terminal websocket connection errors
- Always end watch stream if connection to kube-api ends
- Xterm v4.4.0

## 3.1.0

- Windows pod shell (powershell)
- Simplified internal architecture (improves watch & metrics stability)
- New icon
- Support `kubernetes.io/role` label for node roles
- Unlink binary download on error properly
- Electron v6.1.9

## 3.0.1

- Fix an issue with bundled kubectl

## 3.0.0

- Login / signup removed
- Prometheus fixes
- Helm v3.1.2
- Updated [EULA](https://lakendlabs.com/licenses/lens-eula.md)

## 2.7.0

- Workspaces
- Helm 3 support
- Improved cluster menu
- Snap packaging
- Add setting to allow untrusted certs for external http traffic
- Minor tweaks & bug fixes

## 2.6.4

- Minor bug fixes

## 2.6.3

- Fix kubectl download issue
- Fix terminal missing HTTPS_PROXY environment variable
- Minor bug fixes

## 2.6.2

- Minor bug fixes

## 2.6.1

- Kubernetes watch API reconnect fix
- Minor bug fixes

## 2.6.0

- More clusters supported; Improvements to cluster authentication
- User Interface for CRDs (Custom Resource Definitions)
- Cluster notifications; Display warning events counter on cluster switcher view
- Support for Microsoft Azure AKS + AAD code flow
- Minor bug fixes

## 2.5.1

- Fix cluster add problem on fresh installs

## 2.5.0

- Light theme
- Per cluster HTTP proxy setting
- Load system certificate authorities on MacOS & Windows
- Reorder clusters by dragging
- Improved in-application documentation
- Minor bug fixes

## 2.4.1

- Minor bug fixes.

## 2.4.0

- Allow to configure Prometheus address per cluster
- Allow to configure terminal working directory per cluster
- Improved new user experience: invitation code is not required anymore
- New cluster settings UI
- Fix OIDC with custom CA
- Use configured HTTP proxy for kubectl downloads
- Fix missing icons and fonts for users working offline or behind firewalls
- Minor bug fixes

## 2.3.2

- Minor bug fixes

## 2.3.1

- Minor cluster connection fixes

## 2.3.0

- Massive performance improvements
- Allow to customize cluster icons
- UI for Pod Security Policies
- Support username/password auth type in kubeconfig
- Minor bug fixes

## 2.2.2

- Minor bug fixes

## 2.2.1

- UI performance improvements
- Respect insecure-skip-tls-verification kubeconfig option
- Network timeout tweaks

## 2.2.0

- Allow to configure HTTPS proxy via preferences
- Do not send authorization headers if kubeconfig has client certificate
- Minor UI fixes

## 2.1.4

- OIDC authentication fixes
- Change the local port range from 9000-9900 to 49152-65535
- Minor UI bug fixes
- Show error details when add cluster fails
- Respect namespace defined in kubeconfig
- Notify about new kube contexts in local kubeconfig

## 2.1.1

- Minor kubeconfig auth-provider fixes.

## 2.1.0

- Don't auto-import kubeconfig
- Allow to import contexts from the default kubeconfig
- Show whats-new page if user running new version of app
- UI performance improvements & minor fixes
- Improved error messages when cluster cannot be accessed
- Improved kubeconfig validation
- Sync environment variables from login shell
- Use node affinity selectors to match OS for metrics pods
- Terminal: zsh fixes
- Terminal: override terminal initscript set KUBECONFIG with Lens provided one
- Handle network issues better
- Menu: show "About Lens" also on Linux & Windows
- Notify if cannot open port on boot
- Improve free port finding
- Sort clusters by name

## 2.0.9

- Wait shell init files are written into the disk
- Use always temp file(s) when applying resources
- Bundle server binaries
- Show errorbox on fatal boot errors
- Let app start, if already logged in, when no networking available

## 2.0.8

- Remove clusters with malformed kubeconfig when initializing clusters
- Show & accept EULA before login
- Download the correct kubectl for 32bit and check kubectl md5sums
- 32bit windows support

## 2.0.7

- Really disable invites when no more left. :)

## 2.0.6

- Remove shell outputs before shell process is started
- Catch kubeconfig load errors better
- Fix app initialization & login timeout cases
- Add Report an Issue to Window menu
- Target linux nodes only in metrics pods

## 2.0.5

- Minor bug fixes.

## 2.0.4

- Enable user invitations in menu
- Better handling for possible errors in kubeconfig authontication
- Kill backend processes on application exit
- Update dashboar UI components to v1.10.0
- Introduce "User Mode" feature for clusters
- Run login shells in embedded terminals
- Fix cluster settings page scroll issue

## 2.0.3

- Enable persistence for metrics collection only if cluster has default storage class available
- Fix cluster online checking

## 2.0.2

- AppImage Linux application packaging
- Ensure correct version of `kubectl` on terminal shell
- Better error handling for manually added cluster configrations

## 2.0.1

- Add information to request invitation

## 2.0.0

Initial release of the Lens desktop application. Basic functionality with auto-import of users local kubeconfig for cluster access.

