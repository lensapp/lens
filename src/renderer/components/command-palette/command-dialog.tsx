
import "./command-dialog.scss";
import { Select } from "../select";
import { action, computed, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { Dialog } from "../dialog";
import { isMac } from "../../../common/vars";
import { clusterStore } from "../../../common/cluster-store";
import { workspaceStore } from "../../../common/workspace-store";

@observer
export class CommandDialog extends React.Component {
  @observable visible = false;
  @observable menuIsOpen = true;

  private escHandler(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      this.closeDialog();
    }
  }

  @action
  private shortcutHandler(event: KeyboardEvent) {
    console.log(event);

    if (isMac) {
      if (event.shiftKey && event.metaKey && event.key === "p") {
        this.visible = true;
        this.menuIsOpen = true;
        event.stopPropagation();
      }
    } else {
      if (event.shiftKey && event.ctrlKey && event.key === "p") {
        this.visible = true;
        this.menuIsOpen = true;
        event.stopPropagation();
      }
    }
  }

  private closeDialog() {
    this.menuIsOpen = false;
    setTimeout(() => {
      this.visible = false;
    }, 1000);
  }

  componentDidMount() {
    window.addEventListener("keyup", (e) => this.escHandler(e), true);
    window.addEventListener("keydown", (e) => this.shortcutHandler(e), true);
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.escHandler);
  }

  @computed get options() {
    return commandRegistry.getItems().map((command) => {
      return { value: command.id, label: command.title };
    });
  }

  private onChange(value: string) {
    const command = commandRegistry.getItems().find((cmd) => cmd.id === value);

    console.log(value, command);

    if (!command) {
      return;
    }

    try {
      command.action({
        cluster: clusterStore.active,
        workspace: workspaceStore.currentWorkspace
      });
    } catch(error) {
      console.error("failed to execute command", command.id, error);
    } finally {
      this.closeDialog();
    }
  }

  render() {
    return (
      <Dialog isOpen={this.visible}>
        <div id="command-dialog">
          <Select
            onChange={(v) => this.onChange(v)}
            components={{ DropdownIndicator: null, IndicatorSeparator: null }}
            menuIsOpen={this.menuIsOpen}
            options={this.options}
            autoFocus={true}
            escapeClearsValue={false}
            placeholder="" />
        </div>
      </Dialog>
    );
  }
}
