/**
 * The Orderable interface is used to define an object that has an order number.
 */
export interface Orderable {
  readonly orderNumber: number;
}

export interface MaybeOrderable {
  readonly orderNumber?: number;
}

export const byOrderNumber = <T extends MaybeOrderable>(left: T, right: T) => (
  (left.orderNumber ?? Number.MAX_SAFE_INTEGER) - (right.orderNumber ?? Number.MAX_SAFE_INTEGER)
);
