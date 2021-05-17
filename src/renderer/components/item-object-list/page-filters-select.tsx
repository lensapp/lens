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
