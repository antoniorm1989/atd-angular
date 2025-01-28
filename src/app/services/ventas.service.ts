import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VentaArticuloModel, VentaModel } from '../models/ventas.model';

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

  timbrar(ventaId: number): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/facturacion/timbrar`, { id: ventaId }, this.getHeaders());
  }

  getVentaById(id: number): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${environment.apiUrl}/api/ventas/getVentaById/${id}`);
  }

  descargarFactura(facturaId: string | undefined): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/facturacion/descargar/${facturaId}`, {
      responseType: 'blob' // Especifica que esperas un archivo binario como respuesta
    });
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}