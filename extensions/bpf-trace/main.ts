import { Main } from "@k8slens/extensions";

export default class BpfTraceMainExtension extends Main.LensExtension {
  async onActivate() {
    console.log("[bpf-trace] extension activated");
  }
}
