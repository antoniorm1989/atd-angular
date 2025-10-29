import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VentaArticuloModel, VentaModel, VentaDocumentoModel, VentaPagoModel, VentaEstatusModel, FacturaArticuloModel } from '../models/ventas.model';
import { CatalogoMonedaModel } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private http: HttpClient) {
  }

  getAll(clienteId: number | undefined, ventaEstatus: number, fechaDesde: Date, fechaHasta: Date, backOrder: boolean, page: number, limit: number, sort: string = 'nombre', order: string = 'asc', tipo: number): Observable<{ data: Array<VentaModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    if (ventaEstatus) {
      params = params.set('ventaEstatus', ventaEstatus.toString());
    }
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde.toISOString());
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta.toISOString());
    }
    if (backOrder) {
      params = params.set('backOrder', backOrder.toString());
    }
    // params = params.set('page', clienteId ? clienteId.toString() : '')
    
    return this.http.get<{ data: Array<VentaModel>, total: number }>(
      `${environment.apiUrl}/api/${tipo == 1 ? 'ventas' : 'cotizaciones'}/getAll`,
      { params }
    );
  }

  getById(id: number): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${environment.apiUrl}/api/ventas/getById/${id}`);
  }

  create(ventaModel: VentaModel, tipo: number): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    ventaModel.userId = userData.id;
    return this.http.post<void>(`${environment.apiUrl}/api/${tipo == 1 ? 'ventas' : 'cotizaciones'}/create`, ventaModel, this.getHeaders());
  }

  despachar(articulo: VentaArticuloModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/despachar`, articulo, this.getHeaders());
  }

  getVentaById(id: number): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${environment.apiUrl}/api/ventas/getVentaById/${id}`);
  }

  descargarFactura(facturaId: string | undefined, format: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/facturacion/descargar/${format}/${facturaId}`, {
      responseType: 'blob' // Especifica que esperas un archivo binario como respuesta
    });
  }

  cancelarFactura(ventaFacturaId: number, cancelData: { motivo: any, uuid_sustitucion?: string }): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');

    return this.http.post<void>(`${environment.apiUrl}/api/ventas/cancelarFactura/${ventaFacturaId}`, {
      ...cancelData,
      userId: userData.id
    }, this.getHeaders());
  }

  cancelarFacturaComplementoPago(complementoPagoId: number, cancelData: { motivo: any, uuid_sustitucion?: string, cfdi_uid?: string }): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');

    return this.http.post<void>(`${environment.apiUrl}/api/ventas/cancelarFacturaComplementoPago/${complementoPagoId}`, {
      ...cancelData,
      userId: userData.id
    }, this.getHeaders());
  }

  // comentarios
  updateComentario(ventaId: number, comentarios: string): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/updateComentario/${ventaId}`, { comentarios }, this.getHeaders());
  }

  // documentos
  getDocumentos(ventaId: number): Observable<Array<VentaDocumentoModel>> {
    return this.http.get<Array<VentaDocumentoModel>>(
      `${environment.apiUrl}/api/ventas/getFiles/${ventaId}`
    );
  }

  uploadFile(ventaId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('documento', file);
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/uploadFile/${ventaId}`, formData);
  }

  descargarDocumento(documentoId: number): Observable<Blob> {
    const url = `${environment.apiUrl}/api/ventas/downloadFile/${documentoId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  eliminarDocumento(documentoId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/ventas/deleteFile/${documentoId}`);
  }

  // Pagos y abonos
  getPagos(venta_factura_id: number): Observable<Array<VentaPagoModel>> {
    return this.http.get<Array<VentaPagoModel>>(`${environment.apiUrl}/api/ventas/getPagos/${venta_factura_id}`);
  }
  createPago(ventaFacturaId: number, pago: VentaPagoModel): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    if (pago && pago.usuario) {
      pago.usuario.id = userData.id;
    }

    return this.http.post<void>(`${environment.apiUrl}/api/ventas/createPago/${ventaFacturaId}`, pago, this.getHeaders());
  }
  updatePago(pagoId: number, pago: VentaPagoModel): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    if (pago && pago.usuario) {
      pago.usuario.id = userData.id;
    }

    return this.http.put<void>(`${environment.apiUrl}/api/ventas/updatePago/${pagoId}`, pago, this.getHeaders());
  }
  deletePago(pagoId: number): Observable<any> {
    return this.http.delete<void>(`${environment.apiUrl}/api/ventas/deletePago/${pagoId}`);
  }
  generarComplementoPago(pagoId: number): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/generarComplementoPago/${pagoId}`, {userId: userData.id}, this.getHeaders());
  }

  // Estatus
  getEstatusVenta(id: number): Observable<VentaEstatusModel> {
    return this.http.get<VentaEstatusModel>(`${environment.apiUrl}/api/ventas/getEstatusVenta/${id}`);
  }

  getFacturaArticulos(ventaId: number): Observable<Array<FacturaArticuloModel>> {
    return this.http.get<Array<FacturaArticuloModel>>(`${environment.apiUrl}/api/ventas/getFacturaArticulos/${ventaId}`);
  }

  deleteCotizacion(cotizacionId: number): Observable<any> {
    return this.http.delete<void>(`${environment.apiUrl}/api/cotizaciones/delete/${cotizacionId}`);
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}