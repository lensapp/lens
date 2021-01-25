/**
 * @jest-environment jsdom
 */

import { podsStore } from "../../+workloads-pods/pods.store";
import { Pod } from "../../../api/endpoints";
import { dockStore } from "../dock.store";
import { logTabStore } from "../log-tab.store";
import { deploymentPod1, deploymentPod2, deploymentPod3, dockerPod } from "./pod.mock";


podsStore.items.push(new Pod(dockerPod));
podsStore.items.push(new Pod(deploymentPod1));
podsStore.items.push(new Pod(deploymentPod2));

describe("log tab store", () => {
  afterEach(() => {
    logTabStore.reset();
    dockStore.reset();
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
      showTimestamps: false,
      previous: false
    });
  });

  it("removes item from pods list if pod deleted from store", () => {
    const selectedPod = new Pod(deploymentPod1);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    podsStore.items.pop();

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod],
      selectedPod,
      selectedContainer,
      showTimestamps: false,
      previous: false
    });
  });

  it("adds item into pods list if new sibling pod added to store", () => {
    const selectedPod = new Pod(deploymentPod1);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    podsStore.items.push(new Pod(deploymentPod3));

    expect(logTabStore.getData(dockStore.selectedTabId)).toEqual({
      pods: [selectedPod, deploymentPod3],
      selectedPod,
      selectedContainer,
      showTimestamps: false,
      previous: false
    });
  });

  it("closes tab if no pods left in store", () => {
    const selectedPod = new Pod(deploymentPod1);
    const selectedContainer = selectedPod.getInitContainers()[0];

    logTabStore.createPodTab({
      selectedPod,
      selectedContainer
    });

    podsStore.items.clear();

    expect(logTabStore.getData(dockStore.selectedTabId)).toBeUndefined();
    expect(dockStore.getTabById(dockStore.selectedTabId)).toBeUndefined();
  });
});
