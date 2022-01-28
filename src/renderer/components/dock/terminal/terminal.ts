/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import debounce from "lodash/debounce";
import { IComputedValue, reaction } from "mobx";
import { ITheme, Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type { TabId } from "../dock/store";
import { TerminalApi, TerminalChannels } from "../../../api/terminal-api";
import { disposer } from "../../../utils";
import { isMac, defaultTerminalFontFamily } from "../../../../common/vars";
import { once } from "lodash";
import { clipboard } from "electron";
import logger from "../../../../common/logger";
import type { TerminalConfig } from "../../../../common/user-preferences/preferences-helpers";
import font from "../../fonts/roboto-mono-nerd.ttf";
import type { AddElementEventListener } from "../../../event-listeners/add-element-event-listener.injectable";
import type { AddWindowEventListener } from "../../../event-listeners/add-window-event-listener.injectable";

export interface TerminalDependencies {
  readonly terminalColors: IComputedValue<ITheme>;
  readonly terminalCopyOnSelect: IComputedValue<boolean>;
  readonly terminalConfig: IComputedValue<TerminalConfig>;
  addWindowEventListener: AddWindowEventListener;
  addElementEventListener: AddElementEventListener;
}

export class Terminal {
  public static get spawningPool() {
    return document.getElementById("terminal-init");
  }

  static async preloadFonts() {
    const fontFace = new FontFace(defaultTerminalFontFamily, `url(${font})`);

    await fontFace.load();
    document.fonts.add(fontFace);
  }

  private xterm: XTerm | null;
  private readonly fitAddon = new FitAddon();
  private scrollPos = 0;
  private disposer = disposer();

  protected get elem() {
    return this.xterm?.element;
  }

  protected get viewport() {
    return this.xterm.element.querySelector(".xterm-viewport") as HTMLElement;
  }

  attachTo(parentElem: HTMLElement) {
    parentElem.appendChild(this.elem);
    this.onActivate();
  }

  detach() {
    const { elem } = this;

    if (elem) {
      Terminal.spawningPool.appendChild(elem);
    }
  }

  static create(...args: ConstructorParameters<typeof Terminal>) {
    return new Terminal(...args);
  }

  constructor({ terminalColors, terminalConfig, terminalCopyOnSelect, addWindowEventListener, addElementEventListener }: TerminalDependencies, public tabId: TabId, protected api: TerminalApi) {
    this.xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "bar",
      ...terminalConfig.get(),
      theme: terminalColors.get(),
    });

    // enable terminal addons
    this.xterm.loadAddon(this.fitAddon);

    this.xterm.open(Terminal.spawningPool);
    this.xterm.registerLinkMatcher(/https?:\/\/[^\s]+/i, this.onClickLink);
    this.xterm.attachCustomKeyEventHandler(this.keyHandler);
    this.xterm.onSelectionChange(() => {
      const selection = this.xterm.getSelection().trim();

      if (terminalCopyOnSelect.get() && selection) {
        clipboard.writeText(selection);
      }
    });

    // bind events
    const onDataHandler = this.xterm.onData(this.onData);
    const clearOnce = once(this.onClear);

    const onContextMenu = () => {
      // don't paste if the clipboard doesn't have text
      if (terminalCopyOnSelect.get() && clipboard.has("text/plain")) {
        this.xterm.paste(clipboard.readText());
      }
    };

    this.api
      .once("ready", clearOnce)
      .once("connected", clearOnce)
      .on("data", data => this.xterm.write(data));

    this.disposer.push(
      addElementEventListener(this.viewport, "scroll", () => this.scrollPos = this.viewport.scrollTop),
      addElementEventListener(this.elem, "contextmenu", onContextMenu),
      addWindowEventListener("resize", this.onResize),
      reaction(() => terminalColors.get(), theme => this.xterm.options.theme = theme),
      reaction(() => terminalConfig.get().fontFamily, fontFamily => this.xterm.options.fontFamily = fontFamily),
      reaction(() => terminalConfig.get().fontSize, fontSize => this.xterm.options.fontSize = fontSize),
      () => onDataHandler.dispose(),
      () => this.fitAddon.dispose(),
      () => this.api.removeAllListeners(),
    );
  }

  destroy() {
    if (this.xterm) {
      this.disposer();
      this.xterm.dispose();
      this.xterm = null;
    }
  }

  protected fit = () => {
    // Since this function is debounced we need to read this value as late as possible
    if (!this.xterm) {
      return;
    }

    try {
      this.fitAddon.fit();
      this.api.sendTerminalSize(this.xterm);
    } catch (error) {
      // see https://github.com/lensapp/lens/issues/1891
      logger.error(`[TERMINAL]: failed to resize terminal to fit`, error);
    }
  };

  fitLazy = debounce(this.fit, 250);

  focus = () => {
    this.xterm.focus();
  };

  protected onData = (data: string) => {
    if (this.api.isReady) {
      this.api.sendMessage({
        type: TerminalChannels.STDIN,
        data,
      });
    }
  };

  protected onClear = () => {
    this.xterm.clear();
  };

  protected onResize = () => {
    this.fitLazy();
    this.focus();
  };

  protected onActivate = () => {
    this.fit();
    setTimeout(() => this.focus(), 250); // delay used to prevent focus on active tab
    this.viewport.scrollTop = this.scrollPos; // restore last scroll position
  };

  protected onClickLink = (evt: MouseEvent, link: string) => {
    window.open(link, "_blank");
  };

  protected keyHandler = (evt: KeyboardEvent): boolean => {
    const { code, ctrlKey, metaKey } = evt;

    // Handle custom hotkey bindings
    if (ctrlKey) {
      switch (code) {
        // Ctrl+C: prevent terminal exit on windows / linux (?)
        case "KeyC":
          if (this.xterm.hasSelection()) return false;
          break;

        // Ctrl+W: prevent unexpected terminal tab closing, e.g. editing file in vim
        case "KeyW":
          evt.preventDefault();
          break;
      }
    }

    //Ctrl+K: clear the entire buffer, making the prompt line the new first line on mac os
    if (isMac && metaKey) {
      switch (code) {
        case "KeyK":
          this.onClear();
          break;
      }
    }

    return true;
  };
}
