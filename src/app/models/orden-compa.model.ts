import { float } from "@zxing/library/esm/customTypings";
import { CatalogoUnidadMedidaModel, CatalogoFormaPagoModel, CatalogoMetodoPagoModel, CatalogoObjetoImpuestoModel, CatalogoProductoServicioModel, CatalogoRegimenFiscalModel, CatalogoUsoCfdiModel, CatCmpraVentaEstatus } from "./catalogos.model";
import { User } from "./user";
import { InventoryAlmacenModel } from "./inventory-almacen.model";
import { InventorySucursalModel } from "./inventory-sucursal.model";
import { CatalogoProveedorModel } from "./catalogo-proveedor.model";

export class OrdenCompraModel {

  // Datos generales
  id: number | undefined;
  folio_interno: string | undefined;
  fecha_registro: Date | undefined;
  comentarios: string | undefined;
  responsable: User | undefined;
  proveedor: CatalogoProveedorModel | undefined;
   // relaciones con otros modelos
  articulos: OrdenCompraArticuloModel[] | undefined;
  estatus: OrdenCompraEstatusModel[] | undefined;
  // Forma pago
  condicion_pago: string | undefined;
  tiene_dias_credito: boolean | undefined;
  cantidad_dias_credito: number | undefined;
  moneda: string | undefined;
  tipo_cambio: float | undefined;
  forma_pago: CatalogoFormaPagoModel | undefined;
  metodo_pago: CatalogoMetodoPagoModel | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}

export class OrdenCompraArticuloModel {
  id: number | undefined;
  cantidad: number | undefined;
  precio_orden_compra: float | undefined;
  translada_iva: boolean | undefined;
  translada_iva_porcentaje: float | undefined;
  retiene_iva: boolean | undefined;
  retiene_iva_porcentaje: float | undefined;
  numero_identificacion_fiscal: string | undefined;
  comentarios: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  cantidad_surtidos: number | undefined;
  // relaciones con otros modelos
  objeto_impuesto: CatalogoObjetoImpuestoModel | undefined;
  unidadMedida: CatalogoUnidadMedidaModel | undefined;
  producto_servicio: CatalogoProductoServicioModel | undefined;
  almacen: InventoryAlmacenModel | undefined;
  sucursal : InventorySucursalModel | undefined;
}

export class OrdenCompraEstatusModel {
  id: number | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  estatus: CatCmpraVentaEstatus | undefined;
}