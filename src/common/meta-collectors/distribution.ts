import { ClusterMetaCollector } from "../cluster-meta-manager";
import { ClusterId } from "../cluster-store";

export class Distribution extends ClusterMetaCollector {
  constructor(protected clusterId: ClusterId, protected onSuccess: (result: any) => void, protected onError: (err: string) => void) {
    super()
  }

  start(): void {
    // TODO
  }

  stop(): void {
    // TODO
  }
}
