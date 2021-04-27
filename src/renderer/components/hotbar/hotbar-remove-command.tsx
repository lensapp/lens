import React from "react";
import { observer } from "mobx-react";
import { Select } from "../select";
import { computed } from "mobx";
import { HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { ConfirmDialog } from "../confirm-dialog";

@observer
export class HotbarRemoveCommand extends React.Component {
  @computed get options() {
    return HotbarStore.getInstance().hotbars.map((hotbar) => {
      return { value: hotbar.id, label: hotbar.name };
    });
  }

  onChange(id: string): void {
    const hotbarStore = HotbarStore.getInstance();
    const hotbar = hotbarStore.getById(id);

    if (!hotbar) {
      return;
    }

    CommandOverlay.close();
    ConfirmDialog.open({
      okButtonProps: {
        label: `Remove Hotbar`,
        primary: false,
        accent: true,
      },
      ok: () => {
        hotbarStore.remove(hotbar);
      },
      message: (
        <div className="confirm flex column gaps">
          <p>
            Are you sure you want remove hotbar <b>{hotbar.name}</b>?
          </p>
        </div>
      ),
    });
  }

  render() {
    return (
      <Select
        menuPortalTarget={null}
        onChange={(v) => this.onChange(v.value)}
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuIsOpen={true}
        options={this.options}
        autoFocus={true}
        escapeClearsValue={false}
        placeholder="Remove hotbar" />
    );
  }
}
