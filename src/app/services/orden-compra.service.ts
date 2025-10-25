import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrdenCompraArticuloModel, OrdenCompraModel } from '../models/orden-compra.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {

  constructor(private http: HttpClient) {
  }

  getAll(proveedorId: number | undefined, estatus: number | undefined, fechaDesde: Date | undefined, fechaHasta: Date | undefined, page: number, limit: number, sort: string, order: string): Observable<{ data: Array<OrdenCompraModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

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

    return this.http.get<{ data: Array<OrdenCompraModel>, total: number }>(
      `${environment.apiUrl}/api/ordenCompra/getAll`,
      { params }
    );
  }

  getById(id: number): Observable<OrdenCompraModel> {
    return this.http.get<OrdenCompraModel>(`${environment.apiUrl}/api/ordenCompra/getById/${id}`);
  }

  create(ordenCompraModel: OrdenCompraModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ordenCompra/create`, ordenCompraModel, this.getHeaders());
  }

  update(ordenCompraModel: OrdenCompraModel): Observable<any> {
    return this.http.put<void>(`${environment.apiUrl}/api/ordenCompra/update/${ordenCompraModel.id}`, ordenCompraModel, this.getHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete<void>(`${environment.apiUrl}/api/ordenCompra/delete/${id}`);
  }

  surtir(articulo: OrdenCompraArticuloModel): Observable<any> {
    return this.http.put<void>(`${environment.apiUrl}/api/ordenCompra/surtir/${articulo.id}`, articulo, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}