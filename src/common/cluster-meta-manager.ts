import { autobind } from "../renderer/utils";
import { clusterMetaStore } from "./cluster-meta-store";
import { ClusterId } from "./cluster-store";
import Singleton from "./utils/singleton";

export class StopError extends Error { }

export abstract class ClusterMetaCollector {
  /**
   * start tells the collector to start collecting its metadata once.
   *
   *  - If finished collecting last time (either producing a value or error)
   *    then start to collect again
   *  - If still collected since last time then should continue and **not**
   *    restart
   */
  abstract start(): void;

  /**
   * stop tells the collector to stop collecting its metadata. If `start()` is
   * called after `stop()` then the collector should begin completely fresh.
   *
   * Should not throw if called multiple times.
   */
  abstract stop(): void;
}

/**
 * This is the constructor for a type that extends the abstract class
 * `ClusterMetaCollector`
 *
 * @param clusterId the ID of the cluster that the collector should be targeting
 * @param onSuccess the function that should be called when the collector has
 *                  collected its metadata successfully
 * @param onError   the function that should be called when the collector
 *                  encounters an error during the collection process
 */
export type MetadataConstructor<T extends ClusterMetaCollector> = new (clusterId: ClusterId, onSuccess: (result: any) => void, onError: (err: string) => void) => T;

export class ClusterMetaManager extends Singleton {
  /**
   * registeredCollectors is a mapping between the name of the metadata and the
   * means of creating new collectors when new clusters are activated.
   */
  protected registeredCollectors = new Map<ClusterId, MetadataConstructor<ClusterMetaCollector>>();

  /**
   * createdCollectors is the mapping between clusters and those collectors
   * targeting that cluster. Each are stored so that it can be easily iterated
   * over by name of metadata to be collected and by cluster ID
   */
  protected createdCollectors = new Map<ClusterId, Map<string, ClusterMetaCollector>>();

  protected interval: NodeJS.Timeout

  // the milliseconds since 1970 when the last interval fired
  protected lastInterval = Date.now()

  protected constructor(protected collectionPeriod = 10 * 1000) {
    super()

    this.interval = setInterval(this.onInterval, this.collectionPeriod)
  }

  @autobind()
  protected onInterval() {
    this.lastInterval = Date.now()

    for (const byCluster of this.createdCollectors.values()) {
      for (const collector of byCluster.values()) {
        collector.start()
      }
    }
  }

  /**
   * registerCollector adds the collector to the list of current collectors and
   * starts collection of metadata on all currently active clusters
   *
   * @param name      is the name of the metadata to be collected, will be the
   *                  name of the field in the metadata store
   * @param Collector the type of the collector. This is so that the manager
   *                  can create new instances on demand
   *
   * @throws if `name` has already been registered
   */
  public registerCollector<T extends ClusterMetaCollector>(name: string, CollectorType: MetadataConstructor<T>) {
    if (this.registeredCollectors.has(name)) {
      throw new Error(`A collector for ${name} has already been registered`)
    }

    this.registeredCollectors.set(name, CollectorType)

    /**
     * add the collector to all the clusters currently been collected on
     */
    for (const [clusterId, byCluster] of this.createdCollectors) {
      const collector = new CollectorType(
        clusterId,
        this.onCollectionSuccess.bind(clusterId, name),
        this.onCollectionError.bind(clusterId, name)
      )
      collector.start()
      byCluster.set(name, collector)
    }
  }

  public startCollectingFor(clusterId: ClusterId): () => void {
    if (this.createdCollectors.has(clusterId)) {
      console.log(`CLUSTER-META-MANAGER: already collecting for cluster ID ${clusterId}`)
    } else {
      const collectorsForCluster = new Map()

      for (const [name, CollectorType] of this.registeredCollectors) {
        const collector = new CollectorType(
          clusterId,
          this.onCollectionSuccess.bind(clusterId, name),
          this.onCollectionError.bind(clusterId, name)
        )
        collector.start()
        collectorsForCluster.set(name, collector)
      }

      this.createdCollectors.set(clusterId, collectorsForCluster)
    }

    return () => {
      if (!this.createdCollectors.has(clusterId)) {
        console.log(`CLUSTER-META-MANAGER: already stopped collecting for cluster ID ${clusterId}`)
        return
      }

      for (const collector of this.createdCollectors.get(clusterId).values()) {
        collector.stop()
      }

      this.createdCollectors.delete(clusterId)
    }
  }

  @autobind()
  private onCollectionSuccess(clusterId: ClusterId, metadataName: string, value: any): void {
    clusterMetaStore.updateMetadataValue(clusterId, metadataName, value)
  }

  @autobind()
  private onCollectionError(clusterId: ClusterId, metadataName: string, err: string): void {
    clusterMetaStore.updateMetadataError(clusterId, metadataName, err)
  }

  /**
   * deregisterCollector removes the currently registered collector and stops
   * all instances from collecting
   *
   * @param name the name of the metadata collector to stop collecting
   *
   * @throws if `name` isn't the name of a currently registered metadata collector
   */
  public deregisterCollector(name: string) {
    if (!this.registeredCollectors.has(name)) {
      throw new Error(`No collector for ${name} has been registered`)
    }

    /**
     * stop all collectors by for metadata `name`
     */
    for (const byCluster of this.createdCollectors.values()) {
      byCluster.get(name).stop()
      byCluster.delete(name)
    }

    this.registeredCollectors.delete(name)
  }

  /**
   * setCollectionPeriod updates the time between collection starts and
   * optionally starts one immediately
   *
   * @param newPeriod       the new number of milliseconds between interval
   *                        fires
   * @param fireImmediately if true and `newPeriod` implies the interval would
   *                        have already fired, then fire the interval
   */
  public setCollectionPeriod(newPeriod: number, fireImmediately = true) {
    this.collectionPeriod = newPeriod

    clearInterval(this.interval)
    setInterval(this.onInterval, this.collectionPeriod)

    if (fireImmediately && (this.lastInterval + newPeriod) >= Date.now()) {
      // the last time the interval fired is more than `newPeriod` in the past
      // then fire immediately
      this.onInterval()
    }
  }
}

export const clusterMetaManager = ClusterMetaManager.getInstance<ClusterMetaManager>()
