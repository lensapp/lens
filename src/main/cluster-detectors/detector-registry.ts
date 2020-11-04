import { observable } from "mobx";
import { ClusterMetadata } from "../../common/cluster-store";
import { Cluster } from "../cluster";
import { BaseClusterDetector, ClusterDetectionResult } from "./base-cluster-detector";
import { ClusterIdDetector } from "./cluster-id-detector";
import { DistributionDetector } from "./distribution-detector";
import { LastSeenDetector } from "./last-seen-detector";
import { NodesCountDetector } from "./nodes-count-detector";
import { VersionDetector } from "./version-detector";

export class DetectorRegistry {
  registry = observable.array<typeof BaseClusterDetector>([], { deep: false });

  add(detectorClass: typeof BaseClusterDetector) {
    this.registry.push(detectorClass)
  }

  async detectForCluster(cluster: Cluster): Promise<ClusterMetadata> {
    const results: {[key: string]: ClusterDetectionResult } = {}
    for (const detectorClass of this.registry) {
      const detector = new detectorClass(cluster)
      try {
        const data = await detector.detect()
        if (!data) continue;
        const existingValue = results[detector.key]
        if (existingValue && existingValue.accuracy > data.accuracy) continue; // previous value exists and is more accurate
        results[detector.key] = data
      } catch (e) {
        // detector raised error, do nothing
      }
    }
    const metadata: ClusterMetadata = {}
    for (const [key, result] of Object.entries(results)) {
      metadata[key] = result.value
    }
    return metadata
  }
}

export const detectorRegistry = new DetectorRegistry()
detectorRegistry.add(ClusterIdDetector)
detectorRegistry.add(LastSeenDetector)
detectorRegistry.add(VersionDetector)
detectorRegistry.add(DistributionDetector)
detectorRegistry.add(NodesCountDetector)