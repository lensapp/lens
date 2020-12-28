import React from "react";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { GroupSelectOption, Select, SelectOption, SelectProps } from "../select";
import { FilterType, pageFilters } from "./page-filters.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Icon } from "../icon";
import { FilterIcon } from "./filter-icon";

export interface SelectOptionFilter extends SelectOption {
  type: FilterType;
  selected?: boolean;
}

interface Props extends SelectProps {
  allowEmpty?: boolean;
  disableFilters?: {
    [filterType: string]: boolean;
  };
}

@observer
export class PageFiltersSelect extends React.Component<Props> {
  static defaultProps: Props = {
    allowEmpty: true,
    disableFilters: {},
  };

  @computed get groupedOptions() {
    const options: GroupSelectOption<SelectOptionFilter>[] = [];
    const { disableFilters } = this.props;

    if (!disableFilters[FilterType.NAMESPACE]) {
      const selectedValues = pageFilters.getValues(FilterType.NAMESPACE);

      options.push({
        label: "Namespace",
        options: namespaceStore.items.map(ns => {
          const name = ns.getName();

          return {
            type: FilterType.NAMESPACE,
            value: name,
            icon: <Icon small material="layers"/>,
            selected: selectedValues.includes(name),
          };
        })
      });
    }

    return options;
  }

  @computed get options(): SelectOptionFilter[] {
    return this.groupedOptions.reduce((options, optGroup) => {
      options.push(...optGroup.options);

      return options;
    }, []);
  }

  private formatLabel = (option: SelectOptionFilter) => {
    const { label, value, type, selected } = option;

    return (
      <div className="flex gaps">
        <FilterIcon type={type}/>
        <span>{label || String(value)}</span>
        {selected && <Icon small material="check" className="box right"/>}
      </div>
    );
  };

  private onSelect = (option: SelectOptionFilter) => {
    const { type, value, selected } = option;
    const { addFilter, removeFilter } = pageFilters;
    const filter = { type, value };

    if (!selected) {
      addFilter(filter);
    }
    else {
      removeFilter(filter);
    }
  };

  render() {
    const { groupedOptions, formatLabel, onSelect, options } = this;

    if (!options.length && this.props.allowEmpty) {
      return null;
    }
    const { allowEmpty, disableFilters, ...selectProps } = this.props;
    const selectedOptions = options.filter(opt => opt.selected);

    return (
      <Select
        {...selectProps}
        placeholder={`Filters (${selectedOptions.length}/${options.length})`}
        noOptionsMessage={() => `No filters available.`}
        autoConvertOptions={false}
        tabSelectsValue={false}
        controlShouldRenderValue={false}
        options={groupedOptions}
        formatOptionLabel={formatLabel}
        onChange={onSelect}
      />
    );
  }
}
