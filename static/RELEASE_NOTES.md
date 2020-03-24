# What's new?

Here you can find description of changes we've built into each release. While we try our best to make each upgrade automatic and as smooth as possible, there may be some cases where your might need to do something to ensure the application works smoothly. So please read through the release highlights!

## 3.1.0-beta.1 (current version)

- Support shell to windows pod (powershell)
- New icon
- Electron 6.1.9
- Refactor dashboard server logic to electron main

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

