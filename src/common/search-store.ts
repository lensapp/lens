import { action, computed, observable,reaction } from "mobx";
import { dockStore } from "../renderer/components/dock/dock.store";
import { autobind } from "../renderer/utils";

export class SearchStore {
  @observable searchQuery = ""; // Text in the search input
  @observable occurrences: number[] = []; // Array with line numbers, eg [0, 0, 10, 21, 21, 40...]
  @observable activeOverlayIndex = -1; // Index within the occurrences array. Showing where is activeOverlay currently located

  constructor() {
    reaction(() => dockStore.selectedTabId, () => {
      searchStore.reset();
    });
  }

  /**
   * Sets default activeOverlayIndex
   * @param text An array of any textual data (logs, for example)
   * @param query Search query from input
   */
  @action
  onSearch(text: string[], query = this.searchQuery): void {
    this.searchQuery = query;

    if (!query) {
      return this.reset();
    }

    this.occurrences = this.findOccurrences(text, query);

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
   * Each keyword "occurrence" is saved as index of the the line where keyword was found
   * @param text An array of any textual data (logs, for example)
   * @param query Search query from input
   * @returns Array of line indexes [0, 0, 14, 17, 17, 17, 20...]
   */
  findOccurrences(text: string[], query: string): Array<number> {
    if (!text) return [];
    const occurrences: number[] = [];

    text.forEach((line, index) => {
      const regex = new RegExp(this.escapeRegex(query), "gi");
      const matches = [...line.matchAll(regex)];

      matches.forEach(() => occurrences.push(index));
    });

    return occurrences;
  }

  /**
   * Getting next overlay index within the occurrences array
   * @param loopOver Allows to jump from last element to first
   * @returns next overlay index
   */
  getNextOverlay(loopOver = false): number {
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
  getPrevOverlay(loopOver = false): number {
    const prev = this.activeOverlayIndex - 1;

    if (prev < 0) {
      return loopOver ? this.occurrences.length - 1 : this.activeOverlayIndex;
    }

    return prev;
  }

  @autobind()
  setNextOverlayActive(): void {
    this.activeOverlayIndex = this.getNextOverlay(true);
  }

  @autobind()
  setPrevOverlayActive(): void {
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
  @autobind()
  isActiveOverlay(line: number, occurrence: number): boolean {
    const firstLineIndex = this.occurrences.findIndex(item => item === line);

    return firstLineIndex + occurrence === this.activeOverlayIndex;
  }

  /**
   * An utility methods escaping user string to safely pass it into new Regex(variable)
   * @param value Unescaped string
   */
  escapeRegex(value: string): string {
    return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
  }

  @action
  reset(): void {
    this.searchQuery = "";
    this.activeOverlayIndex = -1;
    this.occurrences = [];
  }
}

export const searchStore = new SearchStore;
