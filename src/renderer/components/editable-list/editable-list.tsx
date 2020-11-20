import "./editable-list.scss"

import React from "react";
import { Icon } from "../icon";
import { Input } from "../input";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { autobind } from "../../utils";
import { _i18n } from "../../i18n";

export interface Props<T> {
  items: T[],
  add: (newItem: string) => void,
  remove: (info: { oldItem: T, index: number }) => void,
  placeholder?: string,

  // An optional prop used to convert T to a displayable string
  // defaults to `String`
  renderItem?: (item: T, index: number) => React.ReactNode,
}

const defaultProps: Partial<Props<any>> = {
  placeholder: _i18n._("Add new item..."),
  renderItem: (item: any, index: number) => <React.Fragment key={index}>{item}</React.Fragment>
}

@observer
export class EditableList<T> extends React.Component<Props<T>> {
  static defaultProps = defaultProps as Props<any>;
  @observable currentNewItem = "";

  @autobind()
  onSubmit(val: string) {
    const { add } = this.props

    if (val) {
      add(val)
      this.currentNewItem = ""
    }
  }

  render() {
    const { items, remove, renderItem, placeholder } = this.props;

    return (
      <div className="EditableList">
        <div className="el-header">
          <Input
            theme="round-black"
            value={this.currentNewItem}
            onSubmit={this.onSubmit}
            placeholder={placeholder}
            onChange={val => this.currentNewItem = val}
          />
        </div>
        <div className="el-contents">
          {
            items.map((item, index) => (
              <div key={item + `${index}`} className="el-item Badge">
                <div>{renderItem(item, index)}</div>
                <div className="el-value-remove">
                  <Icon material="delete_outline" onClick={() => remove(({ index, oldItem: item }))} />
                </div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}
