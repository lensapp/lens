/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { observer } from "mobx-react";
import { HotbarStore } from "../../../common/hotbar-store";
import { CommandOverlay } from "../command-palette";
import { Input, InputValidator } from "../input";

const uniqueHotbarName: InputValidator = {
  condition: ({ required }) => required,
  message: () => "Hotbar with this name already exists",
  validate: value => !HotbarStore.getInstance().getByName(value),
};

@observer
export class HotbarAddCommand extends React.Component {
  onSubmit = (name: string) => {
    if (!name.trim()) {
      return;
    }

    HotbarStore.getInstance().add({ name }, { setActive: true });
    CommandOverlay.close();
  };

  render() {
    return (
      <>
        <Input
          placeholder="Hotbar name"
          autoFocus={true}
          theme="round-black"
          data-test-id="command-palette-hotbar-add-name"
          validators={uniqueHotbarName}
          onSubmit={this.onSubmit}
          dirty={true}
          showValidationLine={true}
        />
        <small className="hint">
          Please provide a new hotbar name (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
        </small>
      </>
    );
  }
}
