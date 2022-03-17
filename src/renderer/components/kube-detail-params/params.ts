/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createPageParam, navigation } from "../../navigation";

/**
 * Used to store `object.selfLink` to show more info about resource in the details panel.
 */
export const kubeDetailsUrlParam = createPageParam({
  name: "kube-details",
});

/**
 * Used to highlight last active/selected table row with the resource.
 *
 * @example
 * If we go to "Nodes (page) -> Node (details) -> Pod (details)",
 * last clicked Node should be "active" while Pod details are shown).
 */
export const kubeSelectedUrlParam = createPageParam({
  name: "kube-selected",
  get defaultValue() {
    return kubeDetailsUrlParam.get();
  },
});

export function toggleDetails(selfLink: string | undefined, resetSelected = true) {
  const current = kubeSelectedUrlParam.get() === selfLink;

  if (current) {
    hideDetails();
  } else {
    showDetails(selfLink, resetSelected);
  }
}

export function showDetails(selfLink = "", resetSelected = true) {
  const detailsUrl = getDetailsUrl(selfLink, resetSelected);

  navigation.merge({ search: detailsUrl });
}

export function hideDetails() {
  showDetails();
}

export function getDetailsUrl(selfLink: string, resetSelected = false, mergeGlobals = true) {
  const params = new URLSearchParams(mergeGlobals ? navigation.searchParams : "");

  params.set(kubeDetailsUrlParam.name, selfLink);

  if (resetSelected) {
    params.delete(kubeSelectedUrlParam.name);
  } else {
    params.set(kubeSelectedUrlParam.name, kubeSelectedUrlParam.get());
  }

  return `?${params}`;
}
