import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CatalogoProveedorModel } from '../models/catalogo-proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoProveedoresService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoProveedorModel>> {
    return this.http.get<Array<CatalogoProveedorModel>>(`${environment.apiUrl}/api/proveedor/getAll`);
  }

  getById(id: number): Observable<CatalogoProveedorModel> {
    return this.http.get<CatalogoProveedorModel>(`${environment.apiUrl}/api/proveedor/getById/${id}`);
  }

  create(catalogoProveedorModel: CatalogoProveedorModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/proveedor/create`, catalogoProveedorModel, this.getHeaders());
  }

  update(catalogoProveedorModel: CatalogoProveedorModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/proveedor/update`, catalogoProveedorModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}