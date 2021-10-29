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
import { CommandOverlay } from "../command-palette";
import { Input } from "../input";
import { isUrl } from "../input/input_validators";
import { WeblinkStore } from "../../../common/weblink-store";
import { computed, makeObservable, observable } from "mobx";

@observer
export class WeblinkAddCommand extends React.Component {
  @observable url = "";
  @observable nameHidden = true;
  @observable dirty = false;

  constructor(props: {}) {
    super(props);

    makeObservable(this);
  }

  onChangeUrl(url: string) {
    this.dirty = true;
    this.url = url;
  }

  onSubmitUrl(url: string) {
    this.dirty = true;
    this.url = url;
    this.nameHidden = false;
  }

  onSubmit(name: string) {
    WeblinkStore.getInstance().add({
      name: name || this.url,
      url: this.url,
    });

    CommandOverlay.close();
  }

  @computed get showValidation() {
    return this.url?.length > 0;
  }

  render() {
    return (
      <>
        <Input
          placeholder="Link URL"
          autoFocus={this.nameHidden}
          theme="round-black"
          data-test-id="command-palette-weblink-add-url"
          validators={[isUrl]}
          dirty={this.dirty}
          value={this.url}
          onChange={(v) => this.onChangeUrl(v)}
          onSubmit={(v) => this.onSubmitUrl(v)}
          showValidationLine={true} />
        { this.nameHidden && (
          <small className="hint">
            Please provide a web link URL (Press &quot;Enter&quot; to continue or &quot;Escape&quot; to cancel)
          </small>
        )}
        { !this.nameHidden && (
          <>
            <Input
              placeholder="Name (optional)"
              autoFocus={true}
              theme="round-black"
              data-test-id="command-palette-weblink-add-name"
              onSubmit={(v) => this.onSubmit(v)}
              dirty={true}/>
            <small className="hint">
              Please provide a name for the web link (Press &quot;Enter&quot; to confirm or &quot;Escape&quot; to cancel)
            </small>
          </>
        )}
      </>
    );
  }
}
