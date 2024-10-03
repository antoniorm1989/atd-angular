import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrdenCompraArticuloModel, OrdenCompraModel } from '../models/orden-compa.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {

  constructor(private http: HttpClient) {
  }

  getAll(proveedorId: number | undefined, estatus: number, fechaDesde: Date, fechaHasta: Date): Observable<Array<OrdenCompraModel>> {
    let params = new HttpParams();
    if (proveedorId) {
      params = params.set('proveedorId', proveedorId.toString());
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
    return this.http.get<Array<OrdenCompraModel>>(`${environment.apiUrl}/api/ordenesCompra/getAll`, { params: params });
  }

  getById(id: number): Observable<OrdenCompraModel> {
    return this.http.get<OrdenCompraModel>(`${environment.apiUrl}/api/ordenesCompra/getById/${id}`);
  }

  create(ordenCompraModel: OrdenCompraModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ordenesCompra/create`, ordenCompraModel, this.getHeaders());
  }

  surtir(articulo: OrdenCompraArticuloModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ordenesCompra/surtir`, articulo, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}