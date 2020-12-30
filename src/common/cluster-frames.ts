import { observable } from "mobx";

export type ClusterFrameInfo = {
  frameId: number;
  processId: number
};

export const clusterFrameMap = observable.map<string, ClusterFrameInfo>();
