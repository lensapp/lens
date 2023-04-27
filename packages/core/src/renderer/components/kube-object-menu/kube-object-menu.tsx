/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { cssNames } from "@k8slens/utilities";
import type { KubeObject } from "@k8slens/kube-object";
import type { MenuActionsProps } from "../menu";
import { MenuItem, MenuActions } from "../menu";
import identity from "lodash/identity";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterNameInjectable from "./cluster-name.injectable";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import kubeObjectMenuItemsInjectable from "./kube-object-menu-items.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import type { HideDetails } from "../kube-detail-params/hide-details.injectable";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";
import type { OnKubeObjectContextMenuOpen } from "./on-context-menu-open.injectable";
import onKubeObjectContextMenuOpenInjectable from "./on-context-menu-open.injectable";
import type { KubeObjectContextMenuItem } from "../../kube-object/handler";
import type { IComputedValue } from "mobx";
import { observable, runInAction } from "mobx";
import type { WithConfirmation } from "../confirm-dialog/with-confirm.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";
import { Icon } from "../icon";
import navigateInjectable from "../../navigation/navigate.injectable";
import withConfirmationInjectable from "../confirm-dialog/with-confirm.injectable";
import { observer } from "mobx-react";

export interface KubeObjectMenuProps<TKubeObject extends KubeObject> extends MenuActionsProps {
  object: TKubeObject;
  editable?: boolean;
  removable?: boolean;
}

interface Dependencies {
  apiManager: ApiManager;
  kubeObjectMenuItems: IComputedValue<React.ElementType[]>;
  clusterName: IComputedValue<string | undefined>;
  hideDetails: HideDetails;
  createEditResourceTab: (kubeObject: KubeObject) => void;
  onContextMenuOpen: OnKubeObjectContextMenuOpen;
  withConfirmation: WithConfirmation;
  navigate: Navigate;
}

@observer
class NonInjectedKubeObjectMenu<Kube extends KubeObject> extends React.Component<KubeObjectMenuProps<Kube> & Dependencies> {
  private menuItems = observable.array<KubeObjectContextMenuItem>();

  componentDidUpdate(prevProps: Readonly<KubeObjectMenuProps<Kube> & Dependencies>): void {
    if (prevProps.object !== this.props.object && this.props.object) {
      this.emitOnContextMenuOpen(this.props.object);
    }
  }

  private renderRemoveMessage(object: KubeObject) {
    const breadcrumbParts = [object.getNs(), object.getName()];
    const breadcrumb = breadcrumbParts.filter(identity).join("/");

    return (
      <p>
        {`Remove ${object.kind} `}
        <b>{breadcrumb}</b>
        {" from "}
        <b>{this.props.clusterName.get()}</b>
        ?
      </p>
    );
  }

  private renderMenuItems() {
    const { object, toolbar } = this.props;

    return this.props.kubeObjectMenuItems.get().map((MenuItem, index) => (
      <MenuItem
        object={object}
        toolbar={toolbar}
        key={`menu-item-${index}`}
      />
    ));
  }

  private emitOnContextMenuOpen(object: KubeObject) {
    const {
      apiManager,
      editable,
      removable,
      hideDetails,
      createEditResourceTab,
      withConfirmation,
      removeAction,
      onContextMenuOpen,
      navigate,
      updateAction,
    } = this.props;

    const store = apiManager.getStore(object.selfLink);
    const isEditable = editable ?? (Boolean(store?.patch) || Boolean(updateAction));
    const isRemovable = removable ?? (Boolean(store?.remove) || Boolean(removeAction));

    runInAction(() => {
      this.menuItems.clear();

      if (isRemovable) {
        this.menuItems.push({
          id: "delete-kube-object",
          title: "Delete",
          icon: "delete",
          onClick: withConfirmation({
            message: this.renderRemoveMessage(object),
            labelOk: "Remove",
            ok: async () => {
              hideDetails();

              if (removeAction) {
                await removeAction();
              } else if (store?.remove) {
                await store.remove(object);
              }
            },
          }),
        });
      }

      if (isEditable) {
        this.menuItems.push({
          id: "edit-kube-object",
          title: "Edit",
          icon: "edit",
          onClick: async () => {
            hideDetails();

            if (updateAction) {
              await updateAction();
            } else {
              createEditResourceTab(object);
            }
          },
        });
      }
    });

    onContextMenuOpen(object, {
      menuItems: this.menuItems,
      navigate,
    });
  }

  private renderContextMenuItems = (object: KubeObject) => (
    [...this.menuItems]
      .reverse() // This is done because the order that we "grow" is right->left
      .map(({ icon, ...rest }) => ({
        ...rest,
        icon: typeof icon === "string"
          ? { material: icon }
          : icon,
      }))
      .map((item, index) => (
        <MenuItem
          key={`context-menu-item-${index}`}
          onClick={() => item.onClick(object)}
          data-testid={`menu-action-${item.title.toLowerCase().replace(/\s+/, "-")}-for-${object.selfLink}`}
        >
          <Icon
            {...item.icon}
            interactive={this.props.toolbar}
            tooltip={item.title}
          />
          <span className="title">
            {item.title}
          </span>
        </MenuItem>
      ))
  );

  render() {
    const {
      className,
      editable,
      removable,
      object,
      removeAction, // This is here so we don't pass it down to `<MenuAction>`
      removeConfirmationMessage, // This is here so we don't pass it down to `<MenuAction>`
      updateAction, // This is here so we don't pass it down to `<MenuAction>`
      ...menuProps
    } = this.props;

    return (
      <MenuActions
        id={`menu-actions-for-kube-object-menu-for-${object?.getId()}`}
        data-testid={`menu-actions-for-kube-object-menu-for-${object?.getId()}`}
        className={cssNames("KubeObjectMenu", className)}
        onOpen={object ? () => this.emitOnContextMenuOpen(object) : undefined}
        {...menuProps}
      >
        {this.renderMenuItems()}
        {object && this.renderContextMenuItems(object)}
      </MenuActions>
    );
  }
}

export const KubeObjectMenu = withInjectables<Dependencies, KubeObjectMenuProps<KubeObject>>(NonInjectedKubeObjectMenu, {
  getProps: (di, props) => ({
    ...props,
    clusterName: di.inject(clusterNameInjectable),
    apiManager: di.inject(apiManagerInjectable),
    createEditResourceTab: di.inject(createEditResourceTabInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
    kubeObjectMenuItems: di.inject(kubeObjectMenuItemsInjectable, props.object),
    onContextMenuOpen: di.inject(onKubeObjectContextMenuOpenInjectable),
    navigate: di.inject(navigateInjectable),
    withConfirmation: di.inject(withConfirmationInjectable),
  }),
}) as <T extends KubeObject>(props: KubeObjectMenuProps<T>) => React.ReactElement;
