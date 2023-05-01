/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./editable-list.scss";

import { observer } from "mobx-react";
import React from "react";

import { Icon } from "@k8slens/icon";
import type { InputProps, InputValidator } from "../input";
import { Input } from "../input";
import type { StrictReactNode, SingleOrMany } from "@k8slens/utilities";

export interface EditableListProps<T> {
  items: T[];
  add: (newItem: string) => void;
  remove: (info: { oldItem: T; index: number }) => void;
  placeholder?: string;
  validators?: SingleOrMany<InputValidator<boolean>>;

  // An optional prop used to convert T to a displayable string
  // defaults to `String`
  renderItem?: (item: T, index: number) => StrictReactNode;
  inputTheme?: InputProps["theme"];
}

export const EditableList = observer(function <T>(props: EditableListProps<T>) {
  const {
    add,
    items,
    remove,
    inputTheme = "round",
    placeholder = "Add new item...",
    renderItem = (item, index) => <React.Fragment key={index}>{item}</React.Fragment>,
    validators,
  } = props;

  return (
    <div className="EditableList">
      <div className="el-header">
        <Input
          theme={inputTheme}
          onSubmit={(val, event) => {
            if (val) {
              event.preventDefault();
              add(val);
            }
          }}
          validators={validators}
          placeholder={placeholder}
          blurOnEnter={false}
          iconRight={({ isDirty }) => isDirty ? <Icon material="keyboard_return" size={16} /> : null}
        />
      </div>
      <div className="el-contents">
        {
          items.map((item, index) => (
            <div key={`${String(item)}${index}`} className="el-item">
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
});
