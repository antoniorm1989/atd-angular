import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryAlmacenModel, InventoryAlmacenTransactionsModel } from '../models/inventory-almacen.model';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InventoryAlmacenService {

  constructor(private http: HttpClient) { }

  getById(id: number | undefined): Observable<InventoryAlmacenModel> {
    return this.http.get<InventoryAlmacenModel>(`${environment.apiUrl}/api/inventoryAlmacen/getById/${id}`, this.getHeaders());
  }

  getInventoryByAlmacen(almacenId: number | undefined): Observable<Array<InventoryAlmacenModel>> {
    return this.http.get<Array<InventoryAlmacenModel>>(`${environment.apiUrl}/api/inventoryAlmacen/getInventoryByAlmacen/${almacenId}`, this.getHeaders());
  }

  getInventoryByAlmacenPaginado(almacenId: number | undefined, page: number, limit: number, sort: string = 'nombre', order: string = 'asc', search: string = ''): Observable<{ data: Array<InventoryAlmacenModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ data: Array<InventoryAlmacenModel>, total: number }>(
      `${environment.apiUrl}/api/inventoryAlmacen/getInventoryByAlmacenPaginado/${almacenId}`,
      {
        headers: this.getHeaders().headers,
        params
      }
    );
  }

  getInventoryByAlmacenByArticulo(almacenId: number | undefined, articuloId: number | undefined): Observable<InventoryAlmacenModel> {
    return this.http.get<InventoryAlmacenModel>(`${environment.apiUrl}/api/inventoryAlmacen/getInventoryByAlmacenByArticulo/${almacenId}/${articuloId}`, this.getHeaders());
  }

  createOrUpdate(inventoryAlmacen: InventoryAlmacenModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/inventoryAlmacen/createOrUpdate`, inventoryAlmacen, this.getHeaders());
  }

  getInventoryTransactions(almacenId: number | undefined, articuloId: number | undefined): Observable<Array<InventoryAlmacenTransactionsModel>> {
    return this.http.get<Array<InventoryAlmacenTransactionsModel>>(`${environment.apiUrl}/api/inventoryAlmacen/getInventoryTransactions/${almacenId}/${articuloId}`, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}