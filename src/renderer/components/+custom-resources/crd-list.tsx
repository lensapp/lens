import "./crd-list.scss"

import React from "react";
import { Trans } from "@lingui/macro";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { stopPropagation } from "../../utils";
import { KubeObjectListLayout } from "../kube-object";
import { crdStore } from "./crd.store";
import { CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { Select, SelectOption } from "../select";
import { navigation, setQueryParams } from "../../navigation";
import { Icon } from "../icon";

enum sortBy {
  kind = "kind",
  group = "group",
  version = "version",
  scope = "scope",
  age = "age",
}

@observer
export class CrdList extends React.Component {
  @computed get groups() {
    return navigation.searchParams.getAsArray("groups")
  }

  onGroupChange(group: string) {
    const groups = [...this.groups];
    const index = groups.findIndex(item => item == group);
    if (index !== -1) groups.splice(index, 1);
    else groups.push(group);
    setQueryParams({ groups })
  }

  render() {
    const selectedGroups = this.groups;
    const sortingCallbacks = {
      [sortBy.kind]: (crd: CustomResourceDefinition) => crd.getResourceKind(),
      [sortBy.group]: (crd: CustomResourceDefinition) => crd.getGroup(),
      [sortBy.version]: (crd: CustomResourceDefinition) => crd.getVersion(),
      [sortBy.scope]: (crd: CustomResourceDefinition) => crd.getScope(),
    };
    return (
      <KubeObjectListLayout
        className="CrdList"
        isClusterScoped={true}
        store={crdStore}
        sortingCallbacks={sortingCallbacks}
        searchFilters={Object.values(sortingCallbacks)}
        filterItems={[
          (items: CustomResourceDefinition[]) => {
            return selectedGroups.length ? items.filter(item => selectedGroups.includes(item.getGroup())) : items
          }
        ]}
        renderHeaderTitle={<Trans>Custom Resources</Trans>}
        customizeHeader={() => {
          let placeholder = <Trans>All groups</Trans>;
          if (selectedGroups.length == 1) placeholder = <><Trans>Group</Trans>: {selectedGroups[0]}</>
          if (selectedGroups.length >= 2) placeholder = <><Trans>Groups</Trans>: {selectedGroups.join(", ")}</>
          return {
            // todo: move to global filters
            filters: (
              <Select
                className="group-select"
                placeholder={placeholder}
                options={Object.keys(crdStore.groups)}
                onChange={({ value: group }: SelectOption) => this.onGroupChange(group)}
                controlShouldRenderValue={false}
                formatOptionLabel={({ value: group }: SelectOption) => {
                  const isSelected = selectedGroups.includes(group);
                  return (
                    <div className="flex gaps align-center">
                      <Icon small material="folder"/>
                      <span>{group}</span>
                      {isSelected && <Icon small material="check" className="box right"/>}
                    </div>
                  )
                }}
              />
            )
          }
        }}
        renderTableHeader={[
          { title: <Trans>Resource</Trans>, className: "kind", sortBy: sortBy.kind },
          { title: <Trans>Group</Trans>, className: "group", sortBy: sortBy.group },
          { title: <Trans>Version</Trans>, className: "version", sortBy: sortBy.group },
          { title: <Trans>Scope</Trans>, className: "scope", sortBy: sortBy.scope },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(crd: CustomResourceDefinition) => {
          return [
            <Link to={crd.getResourceUrl()} onClick={stopPropagation}>
              {crd.getResourceTitle()}
            </Link>,
            crd.getGroup(),
            crd.getVersion(),
            crd.getScope(),
            crd.getAge(),
          ]
        }}
      />
    )
  }
}

