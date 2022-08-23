import styles from "./virtual-table-header.module.scss";
import React from "react";
import { TableHeader, TableHeaderProps } from "./table-header";

export function VirtualTableHeader<Data>(props: TableHeaderProps<Data>) {
  return (
    <TableHeader {...props} className={styles.header}/>
  )
}