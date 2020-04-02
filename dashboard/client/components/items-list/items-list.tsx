import './items-list.scss'
import * as React from 'react'
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Icon } from "../icon";

interface ItemsListProps {
  className?: string;
  disabled?: boolean;
  inline?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  showSelectedItems?: boolean;
  showSelectedIcon?: boolean;
  selectedValues?: any[];
  onSelectChange(currentItem: any, selectedItems: any[]): void;
}

@observer
export class ItemsList extends React.Component<ItemsListProps> {
  static defaultProps: Partial<ItemsListProps> = {
    selectable: true,
    multiSelect: true,
    showSelectedIcon: false,
  }

  onClickItem(itemValue: any) {
    const { selectedValues, multiSelect, onSelectChange } = this.props;
    if (multiSelect) {
      const itemIndex = selectedValues.findIndex(value => value === itemValue);
      if (itemIndex > -1) {
        // remove
        const newSelectedValues = [...selectedValues];
        newSelectedValues.splice(itemIndex, 1);
        onSelectChange(itemValue, newSelectedValues);
      }
      else {
        // add
        const newSelectedValues = [].concat(selectedValues, itemValue);
        onSelectChange(itemValue, newSelectedValues)
      }
    }
    else {
      onSelectChange(itemValue, [itemValue]);
    }
  }

  render() {
    const { disabled, inline, selectable, selectedValues, showSelectedItems, showSelectedIcon } = this.props;
    let { className, children } = this.props;
    className = cssNames('ItemsList flex', className, {
      selectable: selectable,
      "inline wrap": inline,
      column: !inline,
    });
    if (selectable) {
      children = React.Children.toArray(children).map((item: React.ReactElement<ItemProps>) => {
        const itemValue = item.props.value;
        const isSelected = selectedValues.includes(itemValue);
        const isDisabled = disabled !== undefined ? disabled : item.props.disabled;

        if (showSelectedItems === false && isSelected) {
          return null;
        }

        const onClick = (evt: React.MouseEvent<any>) => {
          if (item.props.onClick) item.props.onClick(evt);
          this.onClickItem(itemValue);
        };

        return React.cloneElement(item, {
          showSelectedIcon: showSelectedIcon,
          selected: isSelected,
          disabled: isDisabled,
          onClick: onClick,
        })
      });
    }
    return (
      <ul className={className}>
        {children}
      </ul>
    );
  }
}

interface ItemProps extends React.HTMLProps<any> {
  value: any;
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  showSelectedIcon?: boolean;
}

const defaultProps: Partial<ItemProps> = {
  showSelectedIcon: true,
}

export class Item extends React.Component<ItemProps> {
  static defaultProps = defaultProps as object;

  render() {
    const { disabled, selected, value, showSelectedIcon, children, ...itemProps } = this.props;
    let { className } = this.props;
    className = cssNames('Item flex gaps', className, { disabled, selected });
    const actionIcon = selected ? "remove" : "add";
    return (
      <li {...itemProps} className={className}>
        <div className="value box grow">
          {children}
        </div>
        {showSelectedIcon && selected && (
          <Icon material="check" className="tick-icon box right"/>
        )}
        {!showSelectedIcon && (
          <Icon className="action-icon" material={actionIcon}/>
        )}
      </li>
    );
  }
}
