import React from "react";
import jsYaml from "js-yaml"
import { observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import { AceEditor } from "../ace-editor";
import { dockStore, TabId } from "./dock.store";
import { DockTabStore } from "./dock-tab.store";
import { Ace } from "ace-builds";

interface Props {
  className?: string;
  tabId: TabId;
  value: string;
  onChange(value: string, error?: string): void;
}

@observer
export class EditorPanel extends React.Component<Props> {
  static cursorPos = new DockTabStore<Ace.Point>();

  public editor: AceEditor;

  @observable yamlError = ""

  componentDidMount() {
    // validate and run callback with optional error
    this.onChange(this.props.value || "");

    disposeOnUnmount(this, [
      dockStore.onTabChange(this.onTabChange, { delay: 250 }),
      dockStore.onResize(this.onResize, { delay: 250 }),
    ])
  }

  validate(value: string) {
    try {
      jsYaml.safeLoadAll(value);
      this.yamlError = "";
    } catch (err) {
      this.yamlError = err.toString();
    }
  }

  onTabChange = () => {
    this.editor.focus();
  }

  onResize = () => {
    this.editor.resize();
  }

  onCursorPosChange = (pos: Ace.Point) => {
    EditorPanel.cursorPos.setData(this.props.tabId, pos);
  }

  onChange = (value: string) => {
    this.validate(value);
    if (this.props.onChange) {
      this.props.onChange(value, this.yamlError);
    }
  }

  render() {
    const { value, tabId } = this.props;
    let { className } = this.props;
    className = cssNames("EditorPanel", className);
    const cursorPos = EditorPanel.cursorPos.getData(tabId);
    return (
      <AceEditor
        autoFocus mode="yaml"
        className={className}
        value={value}
        cursorPos={cursorPos}
        onChange={this.onChange}
        onCursorPosChange={this.onCursorPosChange}
        ref={e => this.editor = e}
      />
    )
  }
}
