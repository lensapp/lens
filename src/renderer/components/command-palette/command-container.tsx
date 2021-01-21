
import "./command-container.scss";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { Dialog } from "../dialog";
import { EventEmitter } from "../../../common/event-emitter";
import { subscribeToBroadcast } from "../../../common/ipc";
import { CommandDialog } from "./command-dialog";

export type CommandDialogEvent = {
  component: React.ReactElement
};

const commandDialogBus = new EventEmitter<[CommandDialogEvent]>();

export function openCommandDialog(component: React.ReactElement) {
  commandDialogBus.emit({ component });
}

export function closeCommandDialog() {
  commandDialogBus.emit({ component: null });
}

@observer
export class CommandContainer extends React.Component<{listenPaletteOpen: boolean}> {
  @observable visible = false;
  @observable commandComponent: React.ReactElement;

  private escHandler(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      this.closeDialog();
    }
  }

  @action
  private closeDialog() {
    this.commandComponent = null;
  }

  componentDidMount() {
    if (this.props.listenPaletteOpen) {
      subscribeToBroadcast("command-palette:open", () => {
        openCommandDialog(<CommandDialog />);
      });
    }
    window.addEventListener("keyup", (e) => this.escHandler(e), true);
    commandDialogBus.addListener((event) => {
      console.log(event);
      this.commandComponent = event.component;
    });
  }

  render() {
    return (
      <Dialog isOpen={!!this.commandComponent} animated={false}>
        <div id="command-container">
          {this.commandComponent}
        </div>
      </Dialog>
    );
  }
}
