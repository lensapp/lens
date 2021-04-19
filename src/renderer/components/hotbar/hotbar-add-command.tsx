import React from "react";
import { observer } from "mobx-react";
import { hotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { Input, InputValidator } from "../input";

const uniqueWorkspaceName: InputValidator = {
  condition: ({ required }) => required,
  message: () => `Hotbar with this name already exists`,
  validate: value => !hotbarStore.getByName(value),
};

@observer
export class HotbarAddCommand extends React.Component {

  onSubmit(name: string) {
    if (!name.trim()) {
      return;
    }

    const hotbar = hotbarStore.add({
      name
    });

    hotbarStore.activeHotbarId = hotbar.id;

    CommandOverlay.close();
  }

  render() {
    return (
      <>
        <Input
          placeholder="Hotbar name"
          autoFocus={true}
          theme="round-black"
          data-test-id="command-palette-hotbar-add-name"
          validators={[uniqueWorkspaceName]}
          onSubmit={(v) => this.onSubmit(v)}
          dirty={true}
          showValidationLine={true} />
        <small className="hint">
          Please provide a new hotbar name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }
}
