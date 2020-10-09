import { BaseStore } from "./base-store";
import { ClusterId } from "./cluster-store";
import migrations from "../migrations/cluster-meta-store"
import { action, computed, observable, toJS } from "mobx";

interface ClusterMetadataModel {
  reportingTime: string;
  value?: any;
  error?: string;
}

export interface ClusterMetaStoreModel {
  metadata?: Record<ClusterId, {
    [name: string]: ClusterMetadataModel
  }>
}

export interface ClusterMetaData {
  [name: string]: MetadataContainer;
}

export interface MetadataContainer {
  reportingTime: Date;
  value?: any;
  error?: string;
}

export class ClusterMetaStore extends BaseStore<ClusterMetaStoreModel> {
  @observable metadata = observable.map<ClusterId, ClusterMetaData>()

  private constructor() {
    super({
      configName: "lens-cluster-meta-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      migrations: migrations,
    });
  }

  private updateMetadata(clusterId: ClusterId, name: string, report: MetadataContainer) {
    if (!this.metadata.has(clusterId)) {
      this.metadata.set(clusterId, {})
    }

    this.metadata.get(clusterId)[name] = report
  }

  public updateMetadataValue(clusterId: ClusterId, name: string, value: any) {
    this.updateMetadata(clusterId, name, {
      reportingTime: new Date(),
      value,
    })
  }

  public updateMetadataError(clusterId: ClusterId, name: string, error: string) {
    this.updateMetadata(clusterId, name, {
      reportingTime: new Date(),
      error,
    })
  }

  @action
  protected fromStore({ metadata = {} }: ClusterMetaStoreModel = {}): void {
    const updatedMetadata = this.metadata.toJS()

    for (const [curCluster, curCollected] of this.metadata) {
      if (!(curCluster in metadata)) {
        continue
      }

      const prevCollected = metadata[curCluster]
      delete metadata[curCluster]

      for (const [name, curValue] of Object.entries(curCollected)) {
        if (!(name in prevCollected)) {
          continue
        }

        const prevValue = prevCollected[name]
        delete prevCollected[name]

        const prevReportingTime = new Date(prevValue.reportingTime)
        if (prevReportingTime.getTime() >= curValue.reportingTime.getTime()) {
          updatedMetadata.get(curCluster)[name] = {
            ...prevValue,
            reportingTime: prevReportingTime,
          }
        }
      }

      for (const [newName, newValue] of Object.entries(prevCollected)) {
        const newReportingTime = new Date(newValue.reportingTime)
        updatedMetadata.get(curCluster)[newName] = {
          ...newValue,
          reportingTime: newReportingTime,
        }
      }
    }

    for (const [newCluster, newCollected] of Object.entries(metadata)) {
      updatedMetadata.set(newCluster, {})

      for (const [newName, newValue] of Object.entries(newCollected)) {
        const newReportingTime = new Date(newValue.reportingTime)
        updatedMetadata.get(newCluster)[newName] = {
          ...newValue,
          reportingTime: newReportingTime,
        }
      }
    }

    this.metadata = observable.map(updatedMetadata)
  }

  toJSON() {
    const metadata: ClusterMetaStoreModel["metadata"] = {}
    for (const [clusterId, collected] of this.metadata) {
      const converted: Record<string, ClusterMetadataModel> = {}
      for (const [name, value] of Object.entries(collected)) {
        converted[name] = {
          ...value,
          reportingTime: value.reportingTime.toISOString(),
        }
      }
      metadata[clusterId] = converted
    }

    return toJS({ metadata, }, { recurseEverything: true })
  }
}

export const clusterMetaStore = ClusterMetaStore.getInstance<ClusterMetaStore>()
