import React from "react";
import { LensRendererExtension, Component, K8sApi } from "@k8slens/extensions";
import { Subject } from "@material-ui/icons";
const { Mui: { SvgIcon }, LensIcons } = Component;

function execShell(pod: K8sApi.Pod, container: K8sApi.IPodContainer) {
  let command = `kubectl exec -i -t -n ${pod.getNs()} ${pod.getName()} -c ${container.name} "--"`;

  if (window.navigator.platform !== "Win32") {
    command = `exec ${command}`;
  }

  if (pod.getSelectedNodeOs() === "windows") {
    command = `${command} powershell`;
  } else {
    command = `${command} sh -c "clear; (bash || ash || sh)"`;
  }

  const shell = Component.createTerminalTab({
    title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`
  });

  Component.terminalStore.sendCommand(command, {
    enter: true,
    tabId: shell.id
  });
}

export default class PodMenuRendererExtension extends LensRendererExtension {
  kubeObjectMenuItems: LensRendererExtension["kubeObjectMenuItems"] = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      text: "Pod Shell",
      Icon: () => <SvgIcon component={LensIcons.Ssh} />,
      when: (pod: K8sApi.Pod) => pod.getRunningContainers().length === 1,
      onClick: (pod: K8sApi.Pod) => execShell(pod, pod.getRunningContainers()[0]),
      closeParent: true,
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      text: "Pod Shells",
      Icon: () => <SvgIcon component={LensIcons.Ssh} />,
      when: (pod: K8sApi.Pod) => pod.getRunningContainers().length > 1,
      children: (pod: K8sApi.Pod) => (
        pod.getRunningContainers()
          .map(container => ({
            text: container.name,
            Icon: () => <SvgIcon component={LensIcons.Ssh} />,
            onClick: () => execShell(pod, container),
            closeParent: true,
          }))
      ),
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      text: "Logs",
      Icon: Subject,
      when: (pod: K8sApi.Pod) => pod.getAllContainers().length === 1,
      onClick: (pod: K8sApi.Pod) => (
        Component.logTabStore.createPodTab({
          selectedPod: pod,
          selectedContainer: pod.getAllContainers()[0],
        })
      ),
      closeParent: true,
    },
    {
      kind: "Pod",
      apiVersions: ["v1"],
      text: "Logs",
      Icon: Subject,
      when: (pod: K8sApi.Pod) => pod.getAllContainers().length > 1,
      children: (pod: K8sApi.Pod) => (
        pod.getAllContainers()
          .map(container => ({
            text: container.name,
            Icon: Subject,
            onClick: () => (
              Component.logTabStore.createPodTab({
                selectedPod: pod,
                selectedContainer: container,
              })
            ),
            closeParent: true,
          }))
      ),
      closeParent: true,
    },
  ];
}
