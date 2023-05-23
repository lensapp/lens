/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select-filter.scss";

import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { NamespaceSelectFilterModel, NamespaceSelectFilterOption } from "./namespace-select-filter-model/namespace-select-filter-model";
import { selectAllNamespaces } from "./namespace-select-filter-model/namespace-select-filter-model";
import namespaceSelectFilterModelInjectable from "./namespace-select-filter-model/namespace-select-filter-model.injectable";
import { VariableSizeList } from "react-window";
import { Icon } from "../icon";
import { cssNames, prevDefault } from "@k8slens/utilities";
import { addWindowEventListener } from "../../window/event-listener.injectable";
import { TooltipPosition } from "@k8slens/tooltip";

interface NamespaceSelectFilterProps {
  id: string;
}

interface Dependencies {
  model: NamespaceSelectFilterModel;
}

const Gradient = ({ type }: { type: "left" | "right" }) => (
  <div className={cssNames("gradient", type)} />
);

const NamespaceSelectFilterMenu = observer(({ id, model }: Dependencies & NamespaceSelectFilterProps) => {
  const selectedOptions = model.selectedOptions.get();
  const prefix = selectedOptions.length === 1
    ? "Namespace"
    : "Namespaces";

  return (
    <div className="menu">
      <div className="non-icon">
        <input
          type="text"
          id={`${id}-filter`}
          value={model.filterText.get()}
          onChange={(event) => model.filterText.set(event.target.value)}
          onClick={model.menu.open}
        />
        <Gradient type="left" />
        <label htmlFor={`${id}-filter`}>
          {(
            model.filterText.get() !== ""
              ? model.filterText.get()
              : (
                model.menu.hasSelectedAll.get()
                  ? "All namespaces"
                  : `${prefix}: ${selectedOptions.map(option => option.value).join(", ")}`
              )
          )}
        </label>
        <Gradient type="right" />
      </div>
      <Icon
        className="expand-icon"
        material={model.menu.isOpen.get() ? "expand_less" : "expand_more"}
        onClick={model.menu.toggle}
      />
    </div>
  );
});

const rowHeight = 29;

const NonInjectedNamespaceSelectFilter = observer(({ model, id }: Dependencies & NamespaceSelectFilterProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return addWindowEventListener("click", (event) => {
      if (!model.menu.isOpen.get()) {
        return;
      }

      if (divRef.current?.contains(event.target as Node)) {
        return;
      }

      model.menu.close();
    });
  }, []);

  return (
    <div
      onKeyUp={model.menu.onKeyUp}
      onKeyDown={model.menu.onKeyDown}
      className="namespace-select-filter"
      data-testid="namespace-select-filter"
      id={id}
      ref={divRef}
      tabIndex={1}
    >
      <NamespaceSelectFilterMenu model={model} id={id} />
      {model.menu.isOpen.get() && (
        <div
          className="list-container"
        >
          <VariableSizeList
            className="list"
            width={300}
            height={Math.min(model.filteredOptions.get().length * rowHeight, 300)}
            itemSize={() => rowHeight}
            itemCount={model.filteredOptions.get().length}
            itemData={{
              items: model.filteredOptions.get(),
              model,
            }}
            overscanCount={5}
            innerElementType={"ul"}
          >
            {NamespaceSelectFilterRow}
          </VariableSizeList>
        </div>
      )}
    </div>
  );
});

interface FilterRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    model: NamespaceSelectFilterModel;
    items: NamespaceSelectFilterOption[];
  };
}

const renderSingleOptionIcons = (namespace: string, option: NamespaceSelectFilterOption, model: NamespaceSelectFilterModel) => {
  if (model.isOptionSelected(option)) {
    return (
      <Icon
        small
        material="check"
        className="selected-icon box right"
        data-testid={`namespace-select-filter-option-${namespace}-selected`}
        tooltip={`Remove ${namespace} from selection`}
        onClick={prevDefault(() => model.deselect(namespace))}
      />
    );
  }

  return (
    <Icon
      small
      material="add_box"
      className="add-selection-icon box right"
      data-testid={`namespace-select-filter-option-${namespace}-add-to-selection`}
      tooltip={`Add ${namespace} to selection`}
      onClick={prevDefault(() => model.select(namespace))}
    />
  );
};

const NamespaceSelectFilterRow = observer(({ index, style, data: { model, items }}: FilterRowProps) => {
  const option = items[index];

  return (
    <li
      style={style}
      className={cssNames("option", "flex gaps align-center", {
        "all-namespaces": option.value === selectAllNamespaces,
        "single-namespace": option.value !== selectAllNamespaces,
      })}
      onClick={() => model.onClick(option)}
    >
      {option.value === selectAllNamespaces
        ? <span className="data">All Namespaces</span>
        : (
          <>
            <Icon
              small
              material="layers"
              onClick={prevDefault(() => model.onClick(option))}
              tooltip={{
                preferredPositions: TooltipPosition.LEFT,
                children: `Select only ${option.value}`,
              }}
            />
            <span className="data">{option.value}</span>
            {renderSingleOptionIcons(option.value, option, model)}
          </>
        )}
    </li>
  );
});

export const NamespaceSelectFilter = withInjectables<Dependencies, NamespaceSelectFilterProps>(NonInjectedNamespaceSelectFilter, {
  getProps: (di, props) => ({
    model: di.inject(namespaceSelectFilterModelInjectable),
    ...props,
  }),
});
