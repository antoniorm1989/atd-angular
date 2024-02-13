import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoSucursalModel } from '../models/catalogo-sucursal.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogoSucursalesService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoSucursalModel>> {
    return this.http.get<Array<CatalogoSucursalModel>>(`${environment.apiUrl}/api/sucursal/getAll`);
  }

  getById(id: number): Observable<CatalogoSucursalModel> {
    return this.http.get<CatalogoSucursalModel>(`${environment.apiUrl}/api/sucursal/getById/${id}`);
  }

  create(catalogoSucursalModel: CatalogoSucursalModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/sucursal/create`, catalogoSucursalModel, this.getHeaders());
  }

  update(catalogoSucursalModel: CatalogoSucursalModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/sucursal/update`, catalogoSucursalModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}