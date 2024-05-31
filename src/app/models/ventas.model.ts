import { float } from "@zxing/library/esm/customTypings";
import { CatalogoClienteModel } from "./catalogo-cliente.model";
import { CatalogoUnidadMedidaModel, CatalogoFormaPagoModel, CatalogoMetodoPagoModel, CatalogoObjetoImpuestoModel, CatalogoProductoServicioModel, CatalogoRegimenFiscalModel, CatalogoUsoCfdiModel } from "./catalogos.model";
import { User } from "./user";
import { InventoryAlmacenModel } from "./inventory-almacen.model";
import { InventorySucursalModel } from "./inventory-sucursal.model";

export class VentaModel {
  // Datos generales
  id: number | undefined;
  fecha_compra_cliente: Date | undefined;
  cliente: CatalogoClienteModel | undefined
  vendedor: User | undefined;
  uso_cfdi: CatalogoUsoCfdiModel | undefined;
  comentarios: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  responsable: User | undefined;
  importe: float | undefined;
  // Forma pago
  condicion_pago: string | undefined;
  tiene_dias_credito: boolean | undefined;
  cantidad_dias_credito: number | undefined;
  moneda: string | undefined;
  tipo_cambio: float | undefined;
  forma_pago: CatalogoFormaPagoModel | undefined;
  metodo_pago: CatalogoMetodoPagoModel | undefined;
  // Articulos
  objeto_impuesto: CatalogoObjetoImpuestoModel | undefined
  translada_iva: boolean | undefined;
  translada_iva_porcentaje: float | undefined;
  retiene_iva: boolean | undefined;
  retiene_iva_porcentaje: float | undefined;

  articulos: VentaArticuloModel[] | undefined;
  estatus: VentaEstatusModel[] | undefined;
  constructor(id?: number) {
    this.id = id;
  }
}

export class VentaArticuloModel {
  id: number | undefined;
  precio_venta: float | undefined;
  descuento: float | undefined;
  cantidad: number | undefined;
  numero_identificacion_fiscal: string | undefined;
  unidad_medida: string | undefined;
  comentarios: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  producto_servicio: CatalogoProductoServicioModel | undefined;
  unidadMedida: CatalogoUnidadMedidaModel | undefined;
  almacen: InventoryAlmacenModel | undefined;
  sucursal : InventorySucursalModel | undefined;
  inventory_almacen_id: number | undefined;
}

export class VentaEstatusModel {
  id: number | undefined;
  estatus: string | undefined;
  fecha_estatus: Date | undefined;
  updated_at: Date | undefined;
}