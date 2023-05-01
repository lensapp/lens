/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, observable } from "mobx";

export class SearchStore {
  /**
   * An utility methods escaping user string to safely pass it into new Regex(variable)
   * @param value Unescaped string
   */
  public static escapeRegex(value?: string): string {
    return value ? value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : "";
  }

  /**
   * Text in the search input
   */
  readonly searchQuery = observable.box("");

  /**
   * Array with line numbers, eg [0, 0, 10, 21, 21, 40...]
   */
  readonly occurrences = observable.array<number>();

  /**
   * Index within the occurrences array. Showing where is activeOverlay currently located
   *
   * @observable
   */
  readonly activeOverlayIndex = observable.box(-1);

  /**
   * Sets default activeOverlayIndex
   * @param text An array of any textual data (logs, for example)
   * @param query Search query from input
   */
  public onSearch = action((text?: string[] | null, query = this.searchQuery.get()): void => {
    this.searchQuery.set(query);

    if (!query) {
      return this.reset();
    }

    this.occurrences.replace(this.findOccurrences(text ?? [], query));

    if (!this.occurrences.length) {
      return;
    }

    const activeOverlayIndex = this.activeOverlayIndex.get();

    // If new highlighted keyword in exact same place as previous one, then no changing in active overlay
    if (this.occurrences[activeOverlayIndex] === undefined) {
      this.activeOverlayIndex.set(this.getNextOverlay(true));
    }
  });

  /**
   * Does searching within text array, create a list of search keyword occurrences.
   * Each keyword "occurrence" is saved as index of the line where keyword was found
   * @param lines An array of any textual data (logs, for example)
   * @param query Search query from input
   * @returns Array of line indexes [0, 0, 14, 17, 17, 17, 20...]
   */
  private findOccurrences(lines: string[], query?: string): number[] {
    const regex = new RegExp(SearchStore.escapeRegex(query), "gi");

    return lines
      .flatMap((line, index) => Array.from(line.matchAll(regex), () => index));
  }

  /**
   * Getting next overlay index within the occurrences array
   * @param loopOver Allows to jump from last element to first
   * @returns next overlay index
   */
  private getNextOverlay(loopOver = false): number {
    const activeOverlayIndex = this.activeOverlayIndex.get();
    const next = activeOverlayIndex + 1;

    if (next > this.occurrences.length - 1) {
      return loopOver ? 0 : activeOverlayIndex;
    }

    return next;
  }

  /**
   * Getting previous overlay index within the occurrences array of occurrences
   * @param loopOver Allows to jump from first element to last one
   * @returns previous overlay index
   */
  private getPrevOverlay(loopOver = false): number {
    const activeOverlayIndex = this.activeOverlayIndex.get();
    const prev = activeOverlayIndex - 1;

    if (prev < 0) {
      return loopOver ? this.occurrences.length - 1 : activeOverlayIndex;
    }

    return prev;
  }

  public setNextOverlayActive = action((): void => {
    this.activeOverlayIndex.set(this.getNextOverlay(true));
  });

  public setPrevOverlayActive = action((): void => {
    this.activeOverlayIndex.set(this.getPrevOverlay(true));
  });

  /**
   * Gets line index of where active overlay is located
   * @returns A line index within the text/logs array
   */
  readonly activeOverlayLine = computed(() => this.occurrences[this.activeOverlayIndex.get()]);

  readonly activeFind = computed(() => this.activeOverlayIndex.get() + 1);

  readonly totalFinds = computed(() => this.occurrences.length);

  /**
   * Checks if overlay is active (to highlight it with orange background usually)
   * @param line Index of the line where overlay is located
   * @param occurrence Number of the overlay within one line
   */
  public isActiveOverlay = (line: number, occurrence: number): boolean => {
    const firstLineIndex = this.occurrences.findIndex(item => item === line);

    return firstLineIndex + occurrence === this.activeOverlayIndex.get();
  };

  private reset = action((): void => {
    this.searchQuery.set("");
    this.activeOverlayIndex.set(-1);
    this.occurrences.clear();
  });
}
