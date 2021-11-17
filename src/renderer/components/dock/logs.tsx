/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./logs.scss";

import React from "react";
import { observable, makeObservable, computed, when, reaction, runInAction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";

import { searchStore } from "../../../common/search-store";
import type { DockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { LogResourceSelector } from "./log-resource-selector";
import { LogList } from "./log-list";
import { logStore } from "./log.store";
import { LogSearch } from "./log-search";
import { LogControls } from "./log-controls";
import { LogTabData, logTabStore } from "./log-tab.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { kubeWatchApi } from "../../../common/k8s-api/kube-watch-api";
import { Spinner } from "../spinner";
import { disposingReaction, comparer } from "../../utils";
import type { Pod } from "../../../common/k8s-api/endpoints";
import { Badge } from "../badge";

interface Props {
  className?: string
  tab: DockTab
}

interface GottenPods {
  pods?: Pod[];
  pod: Pod | undefined;
}

@observer
export class Logs extends React.Component<Props> {
  @observable isLoading = false;
  /**
   * Only used for the inital loading of logs so that when logs are shorter
   * than the viewport the user doesn't get incessant spinner every 700ms
   */
  @observable isLoadingInitial = true;

  private logListElement = React.createRef<LogList>(); // A reference for VirtualList component

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([
        podsStore,
      ], {
        namespaces: logTabStore.getNamespaces(),
      }),
      when(() => this.canLoad, () => this.load(true)),
      this.loadWhenPossibleOnTabChange(),
      this.changeSelectedPodWhenCurrentDisappears(),
    ]);
  }

  /**
   * Only used in `componentDidMount`
   */
  private loadWhenPossibleOnTabChange() {
    return disposingReaction(
      () => [this.tabId, this.tabData] as const,
      ([curTabId], [oldTabId]) => {
        if (curTabId !== oldTabId) {
          logStore.clearLogs(this.tabId);
        }

        return when(() => this.canLoad, () => this.load(true));
      },
      {
        equals: comparer.structural,
      },
    );
  }

  /**
   * Only used in `componentDidMount`
   */
  private changeSelectedPodWhenCurrentDisappears() {
    return reaction(() => this.getPods(this.tabData), (data) => {
      if (!data) {
        return;
      }

      const { pods, pod } = data;

      if (pods && !pod && pods.length > 0) {
        const selectedPod = pods[0];

        logTabStore.mergeData(this.tabId, {
          selectedPod: selectedPod.getId(),
          selectedContainer: selectedPod.getContainers()[0]?.name,
        });
      }
    }, {
      fireImmediately: true,
    });
  }

  private getPods(data: LogTabData): GottenPods;
  private getPods(data: LogTabData | undefined): GottenPods | undefined {
    if (!data) {
      return undefined;
    }

    const { podsOwner, selectedPod } = data;

    if (podsOwner) {
      const pods = podsStore.getPodsByOwnerId(podsOwner);
      const pod = pods.find(pod => pod.getId() === selectedPod);

      return { pods, pod };
    }

    return { pod: podsStore.getById(selectedPod) };
  }

  @computed get tabData(): LogTabData {
    return logTabStore.getData(this.tabId);
  }

  @computed get tabId() {
    return this.props.tab.id;
  }

  @computed get canSwap(): boolean {
    const data = this.tabData;

    if (!data) {
      return false;
    }

    const { podsOwner } = data;

    if (!podsOwner) {
      return false;
    }

    return podsStore.getPodsByOwnerId(podsOwner).length > 0;
  }

  @computed get canLoad(): boolean {
    return Boolean(this.getPods(this.tabData)?.pod);
  }

  load = async (initial = false) => {
    runInAction(() => {
      this.isLoading = true;
      this.isLoadingInitial = initial;
    });

    await logStore.load(this.tabId, this.tabData);

    runInAction(() => {
      this.isLoading = false;
      this.isLoadingInitial = false;
    });
  };

  /**
   * Scrolling to active overlay (search word highlight)
   */
  onSearch = () => {
    const { activeOverlayLine } = searchStore;

    if (!this.logListElement.current || activeOverlayLine === undefined) return;
    // Scroll vertically
    this.logListElement.current.scrollToItem(activeOverlayLine, "center");
    // Scroll horizontally in timeout since virtual list need some time to prepare its contents
    setTimeout(() => {
      document.querySelector(".PodLogs .list span.active")?.scrollIntoViewIfNeeded();
    }, 100);
  };

  render() {
    const data = this.tabData;

    if (!data) {
      return null;
    }

    if (!podsStore.isLoaded) {
      return <Spinner center />;
    }

    const logs = logStore.getLogs(this.tabId, data);
    const { podsOwner, selectedContainer, selectedPod, showTimestamps, previous, namespace } = data;
    const { pods, pod } = this.getPods(data);

    if (!pod) {
      return (
        <div className="PodLogs flex column">
          <InfoPanel
            tabId={this.props.tab.id}
            controls={
              <div className="flex gaps align-center">
                <span>Namespace</span>
                <Badge label={namespace} />
                <span>Pod</span>
                <Badge label={selectedPod || "???"} />
                <span>Container</span>
                <Badge label={selectedContainer || "???"} />
              </div>
            }
            showSubmitClose={false}
            showButtons={false}
            showStatusPanel={false}
          />
          <p className="pod-not-found">Pod is no longer found {podsOwner && `under owner ${podsOwner}`}</p>
        </div>
      );
    }

    return (
      <div className="PodLogs flex column">
        <InfoPanel
          tabId={this.props.tab.id}
          controls={
            <div className="flex gaps">
              <LogResourceSelector
                tabId={this.tabId}
                pod={pod}
                pods={pods}
                selectedContainer={selectedContainer}
              />
              {this.isLoading && <Spinner />}
              <LogSearch
                onSearch={this.onSearch}
                logs={logs}
                toPrevOverlay={this.onSearch}
                toNextOverlay={this.onSearch}
              />
            </div>
          }
          showSubmitClose={false}
          showButtons={false}
          showStatusPanel={false}
        />
        <LogList
          logs={logs}
          selectedContainer={selectedContainer}
          isLoading={this.isLoadingInitial}
          load={this.load}
          ref={this.logListElement}
        />
        <LogControls
          tabId={this.tabId}
          pod={pod}
          preferences={{ previous, showTimestamps }}
          logs={logs}
        />
      </div>
    );
  }
}
