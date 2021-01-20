/**
 * @jest-environment jsdom
 */

import { podsStore } from "../../+workloads-pods/pods.store";
import { Pod } from "../../../api/endpoints";
import { dockStore } from "../dock.store";
import { LogTabStore } from "../log-tab.store";
import { deploymentPod1, deploymentPod2, dockerPod } from "./pod.mock";

let logTabStore: LogTabStore = null;

podsStore.items.push(new Pod(dockerPod));
podsStore.items.push(new Pod(deploymentPod1));
podsStore.items.push(new Pod(deploymentPod2));

describe("log tab store", () => {
  beforeEach(async () => {
    logTabStore = new LogTabStore();
  });

  it("creates log tab without sibling pods", () => {
    const selectedPod = new Pod(dockerPod);
    const selectedContainer = selectedPod.getAllContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod],
      selectedPod,
      selectedContainer,
      containers: selectedPod.getContainers(),
      initContainers: [],
      showTimestamps: false,
      previous: false
    });
  });

  it("creates log tab with sibling pods", () => {
    const selectedPod = new Pod(deploymentPod1);
    const siblingPod = new Pod(deploymentPod2);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod, siblingPod],
      selectedPod,
      selectedContainer,
      containers: selectedPod.getContainers(),
      initContainers: selectedPod.getInitContainers(),
      showTimestamps: false,
      previous: false
    });
  });
});