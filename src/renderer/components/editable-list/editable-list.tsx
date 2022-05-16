/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./editable-list.scss";

import { observer } from "mobx-react";
import React from "react";

import { Icon } from "../icon";
import type { InputProps, InputValidator } from "../input";
import { Input } from "../input";
import { autoBind } from "../../utils";
import type { SingleOrMany } from "../../utils";

export interface EditableListProps<T> {
  items: T[];
  add: (newItem: string) => void;
  remove: (info: { oldItem: T; index: number }) => void;
  placeholder?: string;
  validators?: SingleOrMany<InputValidator<boolean>>;

  // An optional prop used to convert T to a displayable string
  // defaults to `String`
  renderItem?: (item: T, index: number) => React.ReactNode;
  inputTheme?: InputProps["theme"];
}

const defaultProps = {
  placeholder: "Add new item...",
  renderItem: (item: any, index: number) => <React.Fragment key={index}>{item}</React.Fragment>,
  inputTheme: "round",
};

@observer
class DefaultedEditableList<T> extends React.Component<EditableListProps<T> & typeof defaultProps> {
  static defaultProps = defaultProps as EditableListProps<any>;

  constructor(props: EditableListProps<T> & typeof defaultProps) {
    super(props);
    autoBind(this);
  }

  onSubmit(val: string, evt: React.KeyboardEvent) {
    if (val) {
      evt.preventDefault();
      this.props.add(val);
    }
  }

  render() {
    const { items, remove, renderItem, placeholder, validators, inputTheme } = this.props;

    return (
      <div className="EditableList">
        <div className="el-header">
          <Input
            theme={inputTheme}
            onSubmit={this.onSubmit}
            validators={validators}
            placeholder={placeholder}
            blurOnEnter={false}
            iconRight={({ isDirty }) => isDirty ? <Icon material="keyboard_return" size={16} /> : null}
          />
        </div>
        <div className="el-contents">
          {
            items.map((item, index) => (
              <div key={`${item}${index}`} className="el-item">
                <div className="el-value-container">
                  <div className="el-value">{renderItem(item, index)}</div>
                </div>
                <div className="el-value-remove">
                  <Icon material="delete_outline" onClick={() => remove(({ index, oldItem: item }))} />
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

export function EditableList<T>(props: EditableListProps<T>) {
  return <DefaultedEditableList {...props as never}/>;
}
