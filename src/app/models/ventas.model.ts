import { float } from "@zxing/library/esm/customTypings";
import { CatalogoClienteModel } from "./catalogo-cliente.model";
import { CatalogoUnidadMedidaModel, CatalogoFormaPagoModel, CatalogoMetodoPagoModel, CatalogoObjetoImpuestoModel, CatalogoProductoServicioModel, CatalogoRegimenFiscalModel, CatalogoUsoCfdiModel, CatalogoCuentaBancariaModel, CatalogoMonedaModel } from "./catalogos.model";
import { User } from "./user";
import { InventoryAlmacenModel } from "./inventory-almacen.model";
import { InventorySucursalModel } from "./inventory-sucursal.model";
import { facturaEstatusEnum, pagoEstatusEnum, ventaEstatusEnum } from "../global/tools";

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
  userId: number | undefined;

  // Forma pago
  condicion_pago: string | undefined;
  tiene_dias_credito: boolean | undefined;
  cantidad_dias_credito: number | undefined;
  moneda: CatalogoMonedaModel | undefined;
  tipo_cambio: float | undefined;
  forma_pago: CatalogoFormaPagoModel | undefined;
  metodo_pago: CatalogoMetodoPagoModel | undefined;

  // Configuracion Articulos
  objeto_impuesto: CatalogoObjetoImpuestoModel | undefined
  translada_iva: boolean | undefined;
  translada_iva_porcentaje: float | undefined;
  retiene_iva_porcentaje: float | undefined;
  articulos: VentaArticuloModel[] | undefined; // articulos no facturados // backorder

  estatus: VentaEstatusModel | undefined;
  facturas: VentaFacturaModel[] | undefined;

  // Datos cuando es solo cotizacion
  rfc: string | undefined;
  razon_social: string | undefined;

  constructor(id?: number) {
    this.id = id;
  }
}

export class VentaArticuloModel {
  id: number | undefined;
  precio_venta: float | undefined;
  descuento: float | undefined;
  tipoDescuento: string | undefined;
  totalConDescuento: float | undefined;
  cantidad: number | undefined;
  stock: number | undefined;
  comentarios: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;

  almacen: InventoryAlmacenModel | undefined;
  sucursal: InventorySucursalModel | undefined;
  inventory_almacen_id: number | undefined;
  backorder: number | undefined;
  user: User | undefined;
  ventaId: number | undefined;
  articulo_descripcion: string | undefined;

  unidad_medida: string | undefined;
  producto_servicio_model: CatalogoUnidadMedidaModel | undefined;
  unidad_medida_model: CatalogoProductoServicioModel | undefined;

  moneda_nombre: string | undefined;
}

export class VentaDocumentoModel {
  id: number | undefined;
  venta_id: number | undefined;
  nombre: string | undefined;
  tipo: string | undefined;
}

export class VentaFacturaModel {
  factura: FacturaModel | undefined;
  articulos: VentaArticuloModel[] | undefined; // articulos solo de la factura
  pagos: VentaPagoModel[] | undefined;
  estatusPago: PagoEstatusModel | undefined;
}

export class VentaPagoModel {
  id: number | undefined;
  deposito: float | undefined;
  referencia: string | undefined;
  moneda: string | undefined;
  tipoCambio: float | undefined;
  formaPago: CatalogoFormaPagoModel | undefined;
  cuentaBancaria: CatalogoCuentaBancariaModel | undefined;
  metodoPago: CatalogoMetodoPagoModel | undefined;
  usuario: User | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  complementoPago: FacturaModel | undefined;
}

export class FacturaModel {
  cfdi_uid: string | undefined;
  folio: string | undefined;
  tipo: TipoFacturaModel | undefined;
  fecha_timbrado: Date | undefined;
  estatus: FacturaEstatusModel | undefined;
}

// FACTURA , PAGO
export class TipoFacturaModel {
  nombre: string | undefined;
}

// BACKORDER, CANCELADA, DESPACHADA, COMPLETADA
// export class VentaEstatusModel {
//   id: number | undefined;
//   nombre: string | undefined;
//   created_at: Date | undefined;
//   user: User | undefined;
//   custom_data?: any;
// }

// PENDIENTE, PARCIAL, PAGADO, REEMBOLSADO
export class PagoEstatusModel {
  id: number | undefined;
  nombre: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  custom_data?: any;
}

// FACTURADA CANCELADA
export class FacturaEstatusModel {
  id: number | undefined;
  nombre: string | undefined;
  created_at: Date | undefined;
  user: User | undefined;
  custom_data?: any;
}

export class VentaEstatusModel{
  venta!: ventaEstatusEnum;
  factura!: facturaEstatusEnum;
  pago!: pagoEstatusEnum;
}

export class FacturaArticuloModel {
  cfdi_uid: string | undefined;
  folio: string | undefined;
  fecha_timbrado: Date | undefined;
  estatus: FacturaEstatusModel | undefined;
  total: number | undefined;
  total_pagado: number | undefined;
  articulos: VentaArticuloModel[] | undefined;
}