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

  getAll(clienteId: number | undefined, estatus: number, fechaDesde: Date, fechaHasta: Date, backOrder: boolean): Observable<Array<VentaModel>> {
    let params = new HttpParams();
    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    if (estatus) {
      params = params.set('estatus', estatus.toString());
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

    return this.http.get<Array<VentaModel>>(`${environment.apiUrl}/api/ventas/getAll`, { params: params });
  }

  getById(id: number): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${environment.apiUrl}/api/ventas/getById/${id}`);
  }

  create(ventaModel: VentaModel): Observable<any> {
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

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}