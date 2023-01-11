/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, observable, makeObservable } from "mobx";
import autoBind from "auto-bind";

export class SearchStore {
  /**
   * An utility methods escaping user string to safely pass it into new Regex(variable)
   * @param value Unescaped string
   */
  public static escapeRegex(value?: string): string {
    return value ? value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") : "";
  }

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  /**
   * Text in the search input
   *
   * @observable
   */
  @observable searchQuery = "";

  /**
   * Array with line numbers, eg [0, 0, 10, 21, 21, 40...]
   *
   * @observable
   */
  @observable occurrences: number[] = [];

  /**
   * Index within the occurrences array. Showing where is activeOverlay currently located
   *
   * @observable
   */
  @observable activeOverlayIndex = -1;

  /**
   * Sets default activeOverlayIndex
   * @param text An array of any textual data (logs, for example)
   * @param query Search query from input
   */
  @action
  public onSearch(text?: string[] | null, query = this.searchQuery): void {
    this.searchQuery = query;

    if (!query) {
      return this.reset();
    }

    this.occurrences = this.findOccurrences(text ?? [], query);

    if (!this.occurrences.length) {
      return;
    }

    // If new highlighted keyword in exact same place as previous one, then no changing in active overlay
    if (this.occurrences[this.activeOverlayIndex] === undefined) {
      this.activeOverlayIndex = this.getNextOverlay(true);
    }
  }

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
    const next = this.activeOverlayIndex + 1;

    if (next > this.occurrences.length - 1) {
      return loopOver ? 0 : this.activeOverlayIndex;
    }

    return next;
  }

  /**
   * Getting previous overlay index within the occurrences array of occurrences
   * @param loopOver Allows to jump from first element to last one
   * @returns previous overlay index
   */
  private getPrevOverlay(loopOver = false): number {
    const prev = this.activeOverlayIndex - 1;

    if (prev < 0) {
      return loopOver ? this.occurrences.length - 1 : this.activeOverlayIndex;
    }

    return prev;
  }

  public setNextOverlayActive(): void {
    this.activeOverlayIndex = this.getNextOverlay(true);
  }

  public setPrevOverlayActive(): void {
    this.activeOverlayIndex = this.getPrevOverlay(true);
  }

  /**
   * Gets line index of where active overlay is located
   * @returns A line index within the text/logs array
   */
  @computed get activeOverlayLine(): number {
    return this.occurrences[this.activeOverlayIndex];
  }

  @computed get activeFind(): number {
    return this.activeOverlayIndex + 1;
  }

  @computed get totalFinds(): number {
    return this.occurrences.length;
  }

  /**
   * Checks if overlay is active (to highlight it with orange background usually)
   * @param line Index of the line where overlay is located
   * @param occurrence Number of the overlay within one line
   */
  public isActiveOverlay(line: number, occurrence: number): boolean {
    const firstLineIndex = this.occurrences.findIndex(item => item === line);

    return firstLineIndex + occurrence === this.activeOverlayIndex;
  }

  @action
  private reset(): void {
    this.searchQuery = "";
    this.activeOverlayIndex = -1;
    this.occurrences = [];
  }
}
