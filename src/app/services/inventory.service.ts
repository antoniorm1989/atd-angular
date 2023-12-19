import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryAlmacenModel } from '../models/inventory-almacen.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryAlmacenService {

  constructor(private http: HttpClient) {
  }

  getInventoryByAlmacen(almacenId: number | undefined): Observable<Array<InventoryAlmacenModel>> {
    return this.http.get<Array<InventoryAlmacenModel>>(`${environment.apiUrl}inventoryAlmacen/getInventoryByAlmacen/${almacenId}`, this.getHeaders());
  }

  getInventoryByAlmacenByArticulo(almacenId: number | undefined, articuloId: number | undefined): Observable<InventoryAlmacenModel> {
    return this.http.get<InventoryAlmacenModel>(`${environment.apiUrl}inventoryAlmacen/getInventoryByAlmacenByArticulo/${almacenId}/${articuloId}`, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}