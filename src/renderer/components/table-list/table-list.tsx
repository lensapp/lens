import type { TableOptions, SortingState, Table as TableType } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import React, { HTMLProps, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { withInjectables } from "@ogre-tools/injectable-react";
import getRandomIdInjectable from "../../../common/utils/get-random-id.injectable";
import { VirtualTable } from "../table/virtual-table";

interface TableProps<T> extends TableOptions<T> {
  className?: string;
  selectable?: boolean;
  configurable?: boolean;
}

export function TableList<Data>({
  columns,
  data,
  className,
  selectable = true,
  configurable = true,
}: TableProps<Data>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const tableColumns = useMemo(() => {
    const cols = [ ...columns ];
    const columnHelper = createColumnHelper<Data>()

    if (selectable) {
      cols.unshift(
        columnHelper.display({
          id: "select",
          header: ({ table }) => (
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          ),
          cell: ({ row }) => (
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          ),
          enableResizing: false,
          minSize: 21,
          size: 21,
        })
      )
    }

    if (configurable) {
      cols.push(
        columnHelper.display({
          id: "config",
          header: () => <ColumnConfigMenu table={table}/>,
          size: 30,
          enableResizing: false,
        })
      )
    }

    return cols;
  }, [data]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    defaultColumn: {
      size: 100,
    }
  });

  return (
    <VirtualTable table={table} className={className} />
  )
}

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className}
      style={{ cursor: "pointer" }}
      {...rest}
    />
  )
}

interface Dependencies {
  id: string;
}

interface Props {
  table: TableType<any>
}

function NonInjectableColumnConfigMenu(props: Dependencies & Props) {
  const id = `${props.id}-column-config`;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Icon material="more_vert" id={id}/>
      <Menu
        htmlFor={id}
        isOpen={open}
        open={() => setOpen(true)}
        close={() => setOpen(false)}
        closeOnScroll
        closeOnClickItem
        closeOnClickOutside
        usePortal
      >
        {props.table.getAllLeafColumns().map(column => {
          return (
            <MenuItem key={column.id}>
              <label>
                <input
                  {...{
                    type: 'checkbox',
                    checked: column.getIsVisible(),
                    onChange: column.getToggleVisibilityHandler(),
                  }}
                />{' '}
                {column.id}
              </label>
            </MenuItem>
          )
        })}
      </Menu>
    </>
  );
}

export const ColumnConfigMenu = withInjectables<Dependencies, Props>(NonInjectableColumnConfigMenu, {
  getProps: (di, props) => ({
    id: di.inject(getRandomIdInjectable)(),
    ...props,
  }),
});