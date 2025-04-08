import { CatalogoCategoriaArticuloModel } from "./catalogo-categoria-articulo.model";
import { CatalogoMonedaModel } from "./catalogos.model";
import { User } from "./user";
import { CatalogoUnidadMedidaModel, CatalogoProductoServicioModel } from "./catalogos.model";


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
  photo: string | undefined;
  cat_articulo_id: number | undefined;
  category: CatalogoCategoriaArticuloModel | undefined;
  es_inventariado: boolean | undefined;
  costo_proveedor: number | undefined;
  costo_importado: number | undefined;
  precio_venta: number | undefined;
  moneda: CatalogoMonedaModel | undefined;

  numero_identificacion_fiscal: string | undefined;
  unidad_medida: string | undefined;
  producto_servicio_id: string | undefined;
  unidad_medida_id: CatalogoProductoServicioModel | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}

export class ArticuloGroup {
  categoria: CatalogoCategoriaArticuloModel | undefined;
  articulos: CatalogoArticuloModel[] | undefined;
}

