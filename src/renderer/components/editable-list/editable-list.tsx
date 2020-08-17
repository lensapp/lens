import "./editable-list.scss"

import React from "React";
import { Icon } from "../icon";
import { Input } from "../input";
import { observable } from "mobx";
import { observer } from "mobx-react";

export interface Props<T> {
  items: T[],
  add: (newItem: string) => void,
  remove: (info: { oldItem: T, index: number }) => void,
  placeholder?: string,

  // An optional prop used to convert T to a displayable string
  // defaults to `String`
  display?: (item: T) => string,
}

@observer
export class EditableList<T> extends React.Component<Props<T>> {
  @observable currentNewItem = "";

  render() {
    const { items, add, remove, display = String, placeholder = "Add new item..." } = this.props;

    return (
      <div className="EditableList">
        <div className="EditableListHeader">
          <Input
            value={this.currentNewItem}
            onSubmit={val => {
              if (val) {
                add(val);
              }
              this.currentNewItem = "";
            }}
            placeholder={placeholder}
            onChange={val => this.currentNewItem = val}
          />
        </div>
        <div className="EditableListContents">
          {
            items
              .map((item, index) => [
                <span key={`${item}-value`}>{display(item)}</span>,
                <div key={`${item}-remove`} className="ValueRemove">
                  <Icon material="delete_outline" onClick={() => remove(({ index, oldItem: item }))} />
                </div>
              ])
              .flat()
          }
        </div>
      </div>
    )
  }
}