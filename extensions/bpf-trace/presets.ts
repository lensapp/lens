/**
 * Curated bpftrace one-liners exposed in the Lens UI.
 *
 * Node presets trace the whole node; pod presets are scoped with
 * kubectl-trace's `$container_pid` helper so they only match the
 * target container's init process tree root.
 */

export interface TracePreset {
  /** Menu label */
  name: string;
  /** Short description shown as tooltip */
  description: string;
  /** bpftrace program */
  program: string;
}

export const NODE_PRESETS: TracePreset[] = [
  {
    name: "New processes (execsnoop)",
    description: "Print every command executed on the node",
    program:
      'tracepoint:syscalls:sys_enter_execve { printf("%-16s ", comm); join(args->argv); }',
  },
  {
    name: "Opened files (opensnoop)",
    description: "Print files being opened, with the opening process",
    program:
      'tracepoint:syscalls:sys_enter_openat { printf("%-16s %s\\n", comm, str(args->filename)); }',
  },
  {
    name: "TCP connections (tcpconnect)",
    description: "Print processes initiating outbound TCP connections",
    program:
      'kprobe:tcp_connect { printf("%-16s pid=%d\\n", comm, pid); }',
  },
  {
    name: "Syscall count by process",
    description: "Count syscalls per process; summary prints on Ctrl-C",
    program: "tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }",
  },
  {
    name: "Disk I/O size histogram",
    description: "Histogram of block I/O request sizes; prints on Ctrl-C",
    program: "tracepoint:block:block_rq_issue { @bytes = hist(args->bytes); }",
  },
];

export const POD_PRESETS: TracePreset[] = [
  {
    name: "New processes in container",
    description: "Print commands executed inside the container",
    program:
      'tracepoint:syscalls:sys_enter_execve /pid == $container_pid/ { join(args->argv); }',
  },
  {
    name: "Files opened by container",
    description: "Print files opened by the container's main process",
    program:
      'tracepoint:syscalls:sys_enter_openat /pid == $container_pid/ { printf("%s\\n", str(args->filename)); }',
  },
  {
    name: "Syscall count for container",
    description: "Count syscalls made by the container's main process; prints on Ctrl-C",
    program:
      "tracepoint:raw_syscalls:sys_enter /pid == $container_pid/ { @[probe] = count(); }",
  },
];

/** POSIX single-quote escaping so bpftrace programs survive the shell. */
export function shellSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
