import { CatalogoSucursalModel } from "./catalogo-sucursal.model";
import { CatalogoArticuloModel } from "./catalogo-articulo.model";
import { User } from "./user";

export class InventorySucursalModel {
  id: number | undefined;
  minimum_stock: number | undefined;
  maximum_stock: number | undefined;
  notify_stock: boolean | undefined;
  sucursal: CatalogoSucursalModel | undefined;
  articulo: CatalogoArticuloModel | undefined;
  inventory_transaction: InventorySucursalTransactionsModel[] | undefined;
}

export class InventorySucursalTransactionsModel {
  id: number | undefined;
  type: number | undefined;
  qty: number | undefined;
  stock: number | undefined;
  comment: string | undefined;
  inventory: InventorySucursalModel | undefined;
  user: User | undefined;

  constructor(type: number, qty: number, comment: string, user: User) {
    this.type = type;
    this.qty = qty;
    this.comment = comment;
    this.user = user;
  }
}