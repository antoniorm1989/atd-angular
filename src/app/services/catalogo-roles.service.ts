import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoRolModel } from '../models/catalogo-rol.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogoRolesService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoRolModel>> {
    return this.http.get<Array<CatalogoRolModel>>(`${environment.apiUrl}rol/getAll`);
  }

  getById(id: number): Observable<CatalogoRolModel> {
    return this.http.get<CatalogoRolModel>(`${environment.apiUrl}rol/getById/${id}`);
  }

  create(catalogoRolModel: CatalogoRolModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}rol/create`, catalogoRolModel, this.getHeaders());
  }

  update(catalogoRolModel: CatalogoRolModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}rol/update`, catalogoRolModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}