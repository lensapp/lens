
import "./command-container.scss";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { Dialog } from "../dialog";
import { EventEmitter } from "../../../common/event-emitter";
import { subscribeToBroadcast } from "../../../common/ipc";
import { CommandDialog } from "./command-dialog";
import { CommandRegistration, commandRegistry } from "../../../extensions/registries/command-registry";

export type CommandDialogEvent = {
  component: React.ReactElement
};

const commandDialogBus = new EventEmitter<[CommandDialogEvent]>();

export class CommandOverlay {
  static open(component: React.ReactElement) {
    commandDialogBus.emit({ component });
  }

  static close() {
    commandDialogBus.emit({ component: null });
  }
}

@observer
export class CommandContainer extends React.Component<{ clusterId?: string }> {
  @observable.ref commandComponent: React.ReactElement;

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

  private findCommandById(commandId: string) {
    return commandRegistry.getItems().find((command) => command.id === commandId);
  }

  private runCommand(command: CommandRegistration) {
    command.action({
      entity: commandRegistry.activeEntity
    });
  }

  componentDidMount() {
    if (this.props.clusterId) {
      subscribeToBroadcast(`command-palette:run-action:${this.props.clusterId}`, (event, commandId: string) => {
        const command = this.findCommandById(commandId);

        if (command) {
          this.runCommand(command);
        }
      });
    } else {
      subscribeToBroadcast("command-palette:open", () => {
        CommandOverlay.open(<CommandDialog />);
      });
    }
    window.addEventListener("keyup", (e) => this.escHandler(e), true);
    commandDialogBus.addListener((event) => {
      this.commandComponent = event.component;
    });
  }

  render() {
    return (
      <Dialog isOpen={!!this.commandComponent} animated={false} onClose={() => this.commandComponent = null}>
        <div id="command-container">
          {this.commandComponent}
        </div>
      </Dialog>
    );
  }
}
