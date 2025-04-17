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
  estatus: VentaEstatusModel | undefined;
  
  // Factura
  factura_cfdi_uid: string | undefined;
  factura_error: string | undefined;
  factura_estatus: FacturaStatus | undefined;
  factura_fecha_timbrado: Date | undefined;
  factura_folio: string | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}

export class VentaArticuloModel {
  id: number | undefined;
  precio_venta: float | undefined;
  descuento: float | undefined;
  cantidad: number | undefined;
  comentarios: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
 
  almacen: InventoryAlmacenModel | undefined;
  sucursal : InventorySucursalModel | undefined;
  inventory_almacen_id: number | undefined;
  backorder: number | undefined;
  user: User | undefined;
  ventaId: number | undefined;
  articulo_descripcion: string | undefined;
  
  numero_identificacion_fiscal: string | undefined;
  unidad_medida: string | undefined;
  producto_servicio_model: CatalogoUnidadMedidaModel | undefined;
  unidad_medida_model: CatalogoProductoServicioModel | undefined;
}

export class VentaEstatusModel {
  id: number | undefined;
  estatus: string | undefined;
  fecha_estatus: Date | undefined;
  updated_at: Date | undefined;
}

export class FacturaStatus{
  id: number | undefined;
  estatus: string | undefined;
  fecha_estatus: Date | undefined;
  created_at: Date | undefined;
  user: User | undefined;

}

export class VentaDocumentoModel{
  id: number | undefined;
  venta_id: number | undefined;
  nombre: string | undefined;
  tipo: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
}
