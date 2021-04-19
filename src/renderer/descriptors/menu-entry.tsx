import React from "react";
import { KubeObject } from "../api/kube-object";
import { ConfirmDialog } from "../components/confirm-dialog";

/**
 * The MenuItem descriptor that all locations should derive the display from
 */
export interface MenuEntry {
  Icon: React.ComponentType;
  text: string,
  onClick: () => void;
  closeParent?: boolean;
}

export interface SubMenuEntry {
  Icon: React.ComponentType;
  text: string,
  children: RootMenuEntry[];
}

export type RootMenuEntry = (MenuEntry | SubMenuEntry);

export interface MessageProps<Object> {
  object: Object;
}

type MessageComponent<Object> = React.ComponentType<MessageProps<Object>>;

export interface RawMenuEntry<KO> {
  Icon: React.ComponentType;
  text: string,
  onClick: (object: KO) => void;
  closeParent?: boolean;
  confirmation?: {
    Message: MessageComponent<KO>,

    /**
     * Defaults to the `text` above if not provided
     */
    labelOk?: string;

    /**
     * Defaults to `"Cancel"`
     */
    labelCancel?: string;
  },
}

export interface RawSubMenuEntry<KO> {
  Icon: React.ComponentType;
  text: string,
  children: RawRootMenuEntry<KO>[] | ((object: KO) => RawRootMenuEntry<void>[]);
}

export type RawRootMenuEntry<KO> = RawSubMenuEntry<KO> | RawMenuEntry<KO>;

function isRawSubMenuEntry<KO>(src: RawRootMenuEntry<KO>): src is RawSubMenuEntry<KO> {
  return Boolean((src as RawSubMenuEntry<KO>).children);
}

export function isSubMenuEntry(src: RootMenuEntry): src is SubMenuEntry {
  return Boolean((src as SubMenuEntry).children);
}

export function finalizeEntry<KO>(object: KO, entry: RawRootMenuEntry<KO>): RootMenuEntry {
  if (isRawSubMenuEntry(entry)) {
    const { Icon, text, children: rawChildren } = entry;
    const children = typeof rawChildren === "function"
      ? rawChildren(object).map(child => finalizeEntry(undefined, child))
      : rawChildren.map(child => finalizeEntry(object, child));

    return { Icon, text, children };
  } else {
    const { onClick: onClickRaw, confirmation, ...rest } = entry;
    const onClick = () => onClickRaw(object);
    const res: MenuEntry = {
      onClick,
      ...rest,
    };

    if (confirmation) {
      const { Message, labelCancel, labelOk } = confirmation;

      res.onClick = () => ConfirmDialog.open({
        labelCancel,
        labelOk,
        message: <Message object={object} />,
        ok: onClick,
      });
    }

    return res;
  }
}

export type SafeWhen<KO extends KubeObject> = (object: KO) => boolean;

export function safeWhen<KO extends KubeObject = KubeObject>(when: (object: KO) => any): SafeWhen<KO> {
  return (object: KO) => {
    try {
      return Boolean(when(object));
    } catch (error) {
      console.warn(`KubeObjectMenuItem filtering threw error: ${error}`);

      return false;
    }
  };
}
