# Lens BPF Trace Extension

eBPF tracing for Kubernetes, right from Lens. This extension integrates
[kubectl-trace](https://github.com/iovisor/kubectl-trace) (bpftrace) into the
Lens UI, addressing [lensapp/lens#1652](https://github.com/lensapp/lens/issues/1652).

Since the open-source Lens core has been retired, this feature ships as a Lens
extension rather than a core change, per the extension-based contribution model
described in the repository README.

## What it does

Adds a **BPF Trace** submenu to the context menu of **Nodes** and running
**Pods**:

- **Node presets**: new processes (execsnoop), opened files (opensnoop),
  TCP connections, syscall counts per process, disk I/O size histogram.
- **Pod presets**: scoped to the target container via kubectl-trace's
  `$container_pid`, e.g. commands executed inside the container, files it
  opens, its syscall counts.
- **Custom program…**: pre-types `kubectl trace run <target> -e ''` into a
  Lens terminal so you can write your own bpftrace program.
- **List trace runs**: shows in-flight trace jobs (`kubectl trace get -A`).

Each action opens a Lens integrated terminal tab and runs `kubectl trace run`
against the current cluster context. Stop a trace with `Ctrl-C`; aggregating
presets (counts, histograms) print their summary at that point.

## Requirements

- `kubectl` on your `PATH` (Lens already requires this).
- The `kubectl-trace` plugin, e.g. via [krew](https://krew.sigs.k8s.io/):
  `kubectl krew install trace`
- **Linux nodes** with a bpftrace-capable kernel (BTF or kernel headers
  available). The trace runs *on the node* inside a privileged job created by
  kubectl-trace, so your desktop OS does not matter — this works from Lens on
  macOS, Windows, and Linux alike.
- RBAC permission to create Jobs (kubectl-trace schedules a Job in the target
  namespace) and to run privileged pods on the target node.

## Build & install

```bash
cd extensions/bpf-trace
npm install
npm run build
mkdir -p ~/.k8slens/extensions/lens-bpf-trace
cp -r package.json dist ~/.k8slens/extensions/lens-bpf-trace/
```

Then restart Lens (or reload extensions) and enable **lens-bpf-trace** in the
Extensions page.

## Security notes

bpftrace runs with elevated privileges on the node. Anyone who can run these
menu items can observe node-wide activity (process names, file paths, network
peers). Gate access with RBAC: if a user cannot create privileged Jobs,
`kubectl trace run` will fail server-side.

## Troubleshooting

Verified against a kind v1.30 cluster (see PR description for a captured
session). Two failure modes worth knowing:

- `fatal error: 'linux/types.h' file not found` in the trace pod: presets
  that read tracepoint `args` (execsnoop, opensnoop) need kernel headers on
  the node or a BTF-enabled bpftrace runner image. kprobe-based presets
  (tcpconnect, syscall counts) work without headers. Pass
  `kubectl trace run --imagename <image>` to use a newer bpftrace runner.
- `pods ... is forbidden: violates PodSecurity "restricted:latest"`: the
  target namespace enforces a Pod Security Standard that rejects the
  privileged trace job. Run with `--namespace` pointing at a namespace
  labeled `pod-security.kubernetes.io/enforce=privileged`.

## Future work

- Preferences page for user-defined preset programs.
- A cluster page listing/deleting trace runs instead of the terminal-based
  `kubectl trace get`.
- Per-container selection for multi-container pods (currently the first
  container is targeted).
