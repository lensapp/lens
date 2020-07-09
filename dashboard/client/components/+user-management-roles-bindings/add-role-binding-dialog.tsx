import "./add-role-binding-dialog.scss";

import React from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Select, SelectOption } from "../select";
import { SubTitle } from "../layout/sub-title";
import { RoleBindingSubject, RoleBinding, ServiceAccount, Role } from "../../api/endpoints";
import { Icon } from "../icon";
import { Input } from "../input";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { Checkbox } from "../checkbox";
import { KubeObject } from "../../api/kube-object";
import { Notifications } from "../notifications";
import { showDetails } from "../../navigation";
import { rolesStore } from "../+user-management-roles/roles.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { serviceAccountsStore } from "../+user-management-service-accounts/service-accounts.store";
import { roleBindingsStore } from "./role-bindings.store";

interface BindingSelectOption extends SelectOption {
  value: string; // binding name
  item?: ServiceAccount | any;
  subject?: RoleBindingSubject; // used for new user/group when users-management-api not available
}

interface Props extends Partial<DialogProps> {
}

@observer
export class AddRoleBindingDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static data: RoleBinding = null;

  static open(roleBinding?: RoleBinding): void {
    AddRoleBindingDialog.isOpen = true;
    AddRoleBindingDialog.data = roleBinding;
  }

  static close(): void {
    AddRoleBindingDialog.isOpen = false;
  }

  get roleBinding(): RoleBinding {
    return AddRoleBindingDialog.data;
  }

  @observable isLoading = false;
  @observable selectedRoleId = "";
  @observable useRoleForBindingName = true;
  @observable bindingName = ""; // new role-binding name
  @observable bindContext = ""; // empty value means "cluster-wide", otherwise bind to namespace
  @observable selectedAccounts = observable.array<ServiceAccount>([], { deep: false });

  @computed get isEditing(): boolean {
    return !!this.roleBinding;
  }

  @computed get selectedRole(): Role {
    return rolesStore.items.find(role => role.getId() === this.selectedRoleId);
  }

  @computed get selectedBindings(): ServiceAccount[] {
    return [
      ...this.selectedAccounts,
    ];
  }

  close = (): void => {
    AddRoleBindingDialog.close();
  }

  async loadData(): Promise<void> {
    const stores = [
      namespaceStore,
      rolesStore,
      serviceAccountsStore,
    ];
    try {
      this.isLoading = true;
      await Promise.all(stores.map(store => store.loadAll()));
    } catch (error) {
      Notifications.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  onOpen = async (): Promise<void> => {
    await this.loadData();

    if (this.roleBinding) {
      const { name, kind } = this.roleBinding.roleRef;
      const role = rolesStore.items.find(role => role.kind === kind && role.getName() === name);
      if (role) {
        this.selectedRoleId = role.getId();
        this.bindContext = role.getNs() || "";
      }
    }
  }

  reset = (): void => {
    this.selectedRoleId = "";
    this.bindContext = "";
    this.selectedAccounts.clear();
  }

  onBindContextChange = (namespace: string): void => {
    this.bindContext = namespace;
    const roleContext = this.selectedRole && this.selectedRole.getNs() || "";
    if (this.bindContext && this.bindContext !== roleContext) {
      this.selectedRoleId = ""; // reset previously selected role for specific context
    }
  }

  createBindings = async (): Promise<void> => {
    const { selectedRole, bindContext: namespace, selectedBindings, bindingName, useRoleForBindingName } = this;

    const subjects = selectedBindings.map((item: KubeObject | RoleBindingSubject) => {
      if (item instanceof KubeObject) {
        return {
          name: item.getName(),
          kind: item.kind,
          namespace: item.getNs(),
        };
      }
      return item;
    });

    try {
      let roleBinding: RoleBinding;
      if (this.isEditing) {
        roleBinding = await roleBindingsStore.updateSubjects({
          roleBinding: this.roleBinding,
          addSubjects: subjects,
        });
      } else {
        const name = useRoleForBindingName ? selectedRole.getName() : bindingName;
        roleBinding = await roleBindingsStore.create({ name, namespace }, {
          subjects: subjects,
          roleRef: {
            name: selectedRole.getName(),
            kind: selectedRole.kind,
          }
        });
      }
      showDetails(roleBinding.selfLink);
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  @computed get roleOptions(): BindingSelectOption[] {
    let roles = rolesStore.items as Role[];
    if (this.bindContext) {
      // show only cluster-roles or roles for selected context namespace
      roles = roles.filter(role => !role.getNs() || role.getNs() === this.bindContext);
    }
    return roles.map(role => {
      const name = role.getName();
      const namespace = role.getNs();
      return {
        value: role.getId(),
        label: name + (namespace ? ` (${namespace})` : "")
      };
    });
  }

  @computed get serviceAccountOptions(): BindingSelectOption[] {
    return serviceAccountsStore.items.map(account => {
      const name = account.getName();
      const namespace = account.getNs();
      return {
        item: account,
        value: name,
        label: <><Icon small material="account_box"/> {name} ({namespace})</>
      };
    });
  }

  renderContents(): JSX.Element {
    const unwrapBindings = (options: BindingSelectOption[]): any[] => options.map(option => option.item || option.subject);
    return (
      <>
        <SubTitle title={<Trans>Context</Trans>}/>
        <NamespaceSelect
          showClusterOption
          themeName="light"
          isDisabled={this.isEditing}
          value={this.bindContext}
          onChange={({ value }): void => this.onBindContextChange(value)}
        />

        <SubTitle title={<Trans>Role</Trans>}/>
        <Select
          key={this.selectedRoleId}
          themeName="light"
          placeholder={_i18n._(t`Select role..`)}
          isDisabled={this.isEditing}
          options={this.roleOptions}
          value={this.selectedRoleId}
          onChange={({ value }): void => this.selectedRoleId = value}
        />
        {
          !this.isEditing && (
            <>
              <Checkbox
                theme="light"
                label={<Trans>Use same name for RoleBinding</Trans>}
                value={this.useRoleForBindingName}
                onChange={(v): void => {
                  this.useRoleForBindingName = v;
                }}
              />
              {
                !this.useRoleForBindingName && (
                  <Input
                    autoFocus
                    placeholder={_i18n._(t`Name`)}
                    disabled={this.isEditing}
                    value={this.bindingName}
                    onChange={(v): void => {
                      this.bindingName = v;
                    }}
                  />
                )
              }
            </>
          )
        }

        <SubTitle title={<Trans>Binding targets</Trans>}/>
        <Select
          isMulti
          themeName="light"
          placeholder={_i18n._(t`Select service accounts`)}
          autoConvertOptions={false}
          options={this.serviceAccountOptions}
          onChange={(opts: BindingSelectOption[]): void => {
            if (!opts) {
              opts = [];
            }
            this.selectedAccounts.replace(unwrapBindings(opts));
          }}
          maxMenuHeight={200}
        />
      </>
    );
  }

  render(): JSX.Element {
    const { ...dialogProps } = this.props;
    const { isEditing, roleBinding, selectedRole, selectedBindings } = this;
    const roleBindingName = roleBinding ? roleBinding.getName() : "";
    const header = (
      <h5>
        {roleBindingName
          ? <Trans>Edit RoleBinding <span className="name">{roleBindingName}</span></Trans>
          : <Trans>Add RoleBinding</Trans>
        }
      </h5>
    );
    const disableNext = this.isLoading || !selectedRole || !selectedBindings.length;
    const nextLabel = isEditing ? <Trans>Update</Trans> : <Trans>Create</Trans>;
    return (
      <Dialog
        {...dialogProps}
        className="AddRoleBindingDialog"
        isOpen={AddRoleBindingDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            nextLabel={nextLabel} next={this.createBindings}
            disabledNext={disableNext}
            loading={this.isLoading}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
