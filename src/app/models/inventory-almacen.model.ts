import { CatalogoAlmacenModel } from "./catalogo-almacen.model";
import { CatalogoArticuloModel } from "./catalogo-articulo.model";
import { User } from "./user";

export class InventoryAlmacenModel {
  id: number | undefined;
  minimum_stock: number | undefined;
  maximum_stock: number | undefined;
  notify_stock: boolean | undefined;
  almacen: CatalogoAlmacenModel | undefined;
  articulo: CatalogoArticuloModel | undefined;
  inventory_transaction: InventoryAlmacenTransactionsModel[] | undefined;
  inventory_transaction_incoming: InventoryAlmacenTransactionsModel[] | undefined;
  total_backorder: number | undefined;
}

export class InventoryAlmacenTransactionsModel {
  id: number | undefined;
  type: number | undefined; // 1 entrada 2 salida
  qty: number | undefined;
  stock: number | undefined;
  comment: string | undefined;
  inventory: InventoryAlmacenModel | undefined;
  user: User | undefined;

  constructor(type: number, qty: number, comment: string, user: User) {
    this.type = type;
    this.qty = qty;
    this.comment = comment;
    this.user = user;
  }
}