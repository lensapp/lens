import { observable } from "mobx";
import { autobind, Singleton } from "../../utils";

interface ExtensionState {
  displayName: string;
  // Possible states the extension can be
  state: "installing" | "uninstalling";
}

@autobind()
export class ExtensionStateStore extends Singleton {
  extensionState = observable.map<string, ExtensionState>();
  @observable startingInstall = false;
}
