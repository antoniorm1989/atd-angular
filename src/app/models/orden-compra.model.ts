import { float } from "@zxing/library/esm/customTypings";
import { CatalogoProveedorModel } from "./catalogo-proveedor.model";
import { CatalogoFormaPagoModel, CatalogoMetodoPagoModel, CatalogoMonedaModel } from "./catalogos.model";
import { User } from "./user";
import { InventoryAlmacenModel } from "./inventory-almacen.model";

export class OrdenCompraModel {
  id: number | undefined;
  venta_id: number | undefined;
  folio_interno: string | undefined;
  comentarios: string | undefined;
  fecha_registro: Date | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;

  // Relaciones
  proveedor: CatalogoProveedorModel | undefined;
  articulos: OrdenCompraArticuloModel[] | undefined;
  responsable: User | undefined;

  // Condiciones de pago
  condicion_pago: string | undefined;
  tiene_dias_credito: boolean | undefined;
  cantidad_dias_credito: number | undefined;

  // Datos de moneda y pagos
  moneda: CatalogoMonedaModel | undefined;
  tipo_cambio: float | undefined;
  forma_pago: CatalogoFormaPagoModel | undefined;
  metodo_pago: CatalogoMetodoPagoModel | undefined;

  // Impuestos
  translada_iva: float | undefined;
  retiene_iva: float | undefined;

  estatus: string | undefined; // 'en proceso', 'parcialmente surtida', 'completa'

  constructor(id?: number) {
    this.id = id;
  }
}

export class OrdenCompraArticuloModel {
  id: number | undefined;
  stock: number | undefined;
  backOrder: number | undefined;
  cantidad: number | undefined;
  cantidad_surtido: number | undefined;
  precio_compra: float | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;

  // Relaciones
  inventario: InventoryAlmacenModel | undefined;
  orden_compra_id: number | undefined;
  inventory_almacen_id: number | undefined;

  userId: number | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}
