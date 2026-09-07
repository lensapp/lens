import React from "react";
import { Renderer } from "@k8slens/extensions";
import {
  NODE_PRESETS,
  POD_PRESETS,
  TracePreset,
  shellSingleQuote,
} from "./presets";

type Pod = Renderer.K8sApi.Pod;
type Node = Renderer.K8sApi.Node;

const {
  Component: { MenuItem, SubMenu, Icon, terminalStore, createTerminalTab },
  Navigation,
} = Renderer;

function prevDefault<E extends React.SyntheticEvent>(handler: (event: E) => void) {
  return (event: E) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  };
}

/**
 * Opens a Lens terminal tab and types the command into it.
 * When `execute` is false the command is left on the prompt so the
 * user can edit it (used by the "Custom program…" items).
 */
function runInTerminal(title: string, command: string, execute = true) {
  const tab = createTerminalTab({ title });

  terminalStore.sendCommand(command, {
    enter: execute,
    tabId: tab.id,
  });
  Navigation.hideDetails();
}

interface TraceTarget {
  /** e.g. "node/worker-1" or "pod/nginx-abc" */
  ref: string;
  /** Extra kubectl-trace flags, e.g. namespace/container for pods */
  flags?: string[];
  /** Terminal tab title */
  title: string;
}

function traceCommand(target: TraceTarget, program?: string): string {
  const parts = ["kubectl", "trace", "run", target.ref, ...(target.flags ?? [])];

  parts.push("-e", program ? shellSingleQuote(program) : "''");

  return parts.join(" ");
}

function renderSubMenu(target: TraceTarget, presets: TracePreset[], toolbar?: boolean) {
  return (
    <MenuItem onClick={prevDefault(() => runInTerminal(target.title, traceCommand(target, presets[0].program)))}>
      <Icon
        material="bug_report"
        interactive={toolbar}
        tooltip={toolbar && "BPF Trace (kubectl-trace)"}
      />
      <span className="title">BPF Trace</span>
      <Icon className="arrow" material="keyboard_arrow_right" />
      <SubMenu>
        {presets.map((preset) => (
          <MenuItem
            key={preset.name}
            onClick={prevDefault(() => runInTerminal(target.title, traceCommand(target, preset.program)))}
            title={preset.description}
          >
            <span className="title">{preset.name}</span>
          </MenuItem>
        ))}
        <MenuItem
          onClick={prevDefault(() => runInTerminal(target.title, traceCommand(target), false))}
          title="Prepares a kubectl trace run command in the terminal for you to edit"
        >
          <span className="title">Custom program…</span>
        </MenuItem>
        <MenuItem
          onClick={prevDefault(() => runInTerminal("kubectl-trace: runs", "kubectl trace get --all-namespaces"))}
          title="List trace jobs currently running in the cluster"
        >
          <span className="title">List trace runs</span>
        </MenuItem>
      </SubMenu>
    </MenuItem>
  );
}

export function NodeTraceMenuItem(props: Renderer.Component.KubeObjectMenuProps<Node>) {
  const { object: node, toolbar } = props;

  if (!node) return null;

  const target: TraceTarget = {
    ref: `node/${node.getName()}`,
    title: `bpftrace: node/${node.getName()}`,
  };

  return renderSubMenu(target, NODE_PRESETS, toolbar);
}

export function PodTraceMenuItem(props: Renderer.Component.KubeObjectMenuProps<Pod>) {
  const { object: pod, toolbar } = props;

  if (!pod) return null;

  // Tracing attaches at the node level; only running pods have a node + pid.
  if (pod.getStatusMessage() !== "Running") return null;

  const container = pod.getContainers()[0]?.name;
  const target: TraceTarget = {
    ref: `pod/${pod.getName()}`,
    flags: [
      "--namespace", pod.getNs(),
      ...(container ? ["--container", container] : []),
    ],
    title: `bpftrace: pod/${pod.getName()}`,
  };

  return renderSubMenu(target, POD_PRESETS, toolbar);
}
