import { action, IEnhancer, IObservableSetInitialValues, makeObservable, ObservableSet } from "mobx";

export class ToggleSet<T> extends Set<T> {
  public toggle(value: T): void {
    if (!this.delete(value)) {
      // Set.prototype.delete returns false if `value` was not in the set
      this.add(value);
    }
  }
}

export class ObservableToggleSet<T> extends ObservableSet<T> {
  constructor(data?: IObservableSetInitialValues<T>, enhancer?: IEnhancer<T>) {
    super(data, enhancer);

    makeObservable(this);
  }

  @action
  public toggle(value: T): void {
    if (!this.delete(value)) {
      // Set.prototype.delete returns false if `value` was not in the set
      this.add(value);
    }
  }
}
