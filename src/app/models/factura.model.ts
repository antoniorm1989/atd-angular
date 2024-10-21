export class FacturaModel {
  tipoComprobante: string | undefined;
  folioFiscal: string | undefined;
  fecha_expedicion: string | undefined;
  lugar_expedicion: string | undefined;
  exportacion: string | undefined;
  emisor: EmisorModel | undefined;
  receptor: ReceptorModel | undefined;
  articulo: FacturaArticuloModel | undefined;
  subTotal: string | undefined;
  subTotalIva: string | undefined;
  total: string | undefined;
  formaPago: string | undefined;
  metodoPago: string | undefined;
  moneda: string | undefined;
}

export class EmisorModel {
  nombre: string | undefined;
  rfc: string | undefined;
  domicilio_fiscal: string | undefined;
  regimen_fiscal: string | undefined;
}

export class ReceptorModel {
  nombre: string | undefined;
  uso_cfdi: string | undefined;
  rfc: string | undefined;
  domicilio_fiscal: string | undefined;
  regimen_fiscal: string | undefined;
}

export class FacturaArticuloModel {
  unidad: string | undefined;
  producto_servicio: string | undefined;
  cantidad: string | undefined;
  descripcion: string | undefined;
  precio_unitario: string | undefined;
  importe: string | undefined;
  p_unitario_number: number | undefined;
}