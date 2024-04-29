import { CatalogoCategoriaArticuloModel } from "./catalogo-categoria-articulo.model";
import { User } from "./user";

export class CatalogoArticuloModel {
  id: number | undefined;
  part_number: string | undefined;
  description: string | undefined;
  show_admin_users: boolean | undefined;
  status: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  user: User | undefined;
  comment: string | undefined;
  precio_venta: number | undefined;
  cost: number | undefined;
  photo: string | undefined;
  cat_articulo_id: number | undefined;
  category: CatalogoCategoriaArticuloModel | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}

export class ArticuloGroup {
  categoria: CatalogoCategoriaArticuloModel | undefined;
  articulos: CatalogoArticuloModel[] | undefined;
}