import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InventorySucursalModel, InventorySucursalTransactionsModel } from '../models/inventory-sucursal.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventorySucursalService {

  constructor(private http: HttpClient) {
  }

  getById(id: number | undefined): Observable<InventorySucursalModel> {
    return this.http.get<InventorySucursalModel>(`${environment.apiUrl}inventorySucursal/getById/${id}`, this.getHeaders());
  }

  getInventoryBySucursal(sucursalId: number | undefined): Observable<Array<InventorySucursalModel>> {
    return this.http.get<Array<InventorySucursalModel>>(`${environment.apiUrl}inventorySucursal/getInventoryBySucursal/${sucursalId}`, this.getHeaders());
  }

  getInventoryBySucursalByArticulo(sucursalId: number | undefined, articuloId: number | undefined): Observable<InventorySucursalModel> {
    return this.http.get<InventorySucursalModel>(`${environment.apiUrl}inventorySucursal/getInventoryBySucursalByArticulo/${sucursalId}/${articuloId}`, this.getHeaders());
  }

  createOrUpdate(inventorySucursal: InventorySucursalModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}inventorySucursal/createOrUpdate`, inventorySucursal, this.getHeaders());
  }

  getInventoryTransactions(sucursalId: number | undefined, articuloId: number | undefined): Observable<Array<InventorySucursalTransactionsModel>> {
    return this.http.get<Array<InventorySucursalTransactionsModel>>(`${environment.apiUrl}inventorySucursal/getInventoryTransactions/${sucursalId}/${articuloId}`, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}