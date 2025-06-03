import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VentaArticuloModel, VentaModel, VentaDocumentoModel } from '../models/ventas.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private http: HttpClient) {
  }

  getAll(clienteId: number | undefined, facturaEstatus: number, ventaEstatus: number, fechaDesde: Date, fechaHasta: Date, backOrder: boolean, page: number, limit: number, sort: string = 'nombre', order: string = 'asc'): Observable<{ data: Array<VentaModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    if (facturaEstatus) {
      params = params.set('facturaEstatus', facturaEstatus.toString());
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
    params = params.set('page', clienteId ? clienteId.toString() : '')

    

    return this.http.get<{ data: Array<VentaModel>, total: number }>(
      `${environment.apiUrl}/api/ventas/getAll`,
      { params }
    );
  }

  getById(id: number): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${environment.apiUrl}/api/ventas/getById/${id}`);
  }

  create(ventaModel: VentaModel): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');
    ventaModel.userId = userData.id;
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/create`, ventaModel, this.getHeaders());
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

  updateComentario(ventaId: number, comentarios: string): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/updateComentario/${ventaId}`, { comentarios }, this.getHeaders());
  }

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

  cancelarVenta(ventaId: number, fechaCancelacion: Date, motivoCancelacion: string, folioSustituto: string, facturaId: String): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('user_data') || '{"name":"","last_name":""}');

    return this.http.post<void>(`${environment.apiUrl}/api/ventas/cancelarVenta/${ventaId}`, {
      fechaCancelacion,
      motivoCancelacion,
      folioSustituto,
      userId: userData.id,
      facturaId
    }, this.getHeaders());
  }

  obtenerFacturasEstatus(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/ventas/getFacturasEstatus/${id}`);
  }

  obtenerVentaEstatus(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/ventas/getVentaEstatus/${id}`);
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}