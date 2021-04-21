import { action, ObservableSet } from "mobx";

export class ToggleSet<T> extends Set<T> {
  public toggle(value: T): void {
    if (!this.delete(value)) {
      // Set.prototype.delete returns false if `value` was not in the set
      this.add(value);
    }
  }
}

export class ObservableToggleSet<T> extends ObservableSet<T> {
  @action
  public toggle(value: T): void {
    if (!this.delete(value)) {
      // Set.prototype.delete returns false if `value` was not in the set
      this.add(value);
    }
  }
}
