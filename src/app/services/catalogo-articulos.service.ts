import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoArticuloModel } from '../models/catalogo-articulo.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogoArticulosService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoArticuloModel>> {
    return this.http.get<Array<CatalogoArticuloModel>>(`${environment.apiUrl}catArticulo/getAll`);
  }

  getById(id: number): Observable<CatalogoArticuloModel> {
    return this.http.get<CatalogoArticuloModel>(`${environment.apiUrl}catArticulo/getById/${id}`);
  }

  create(catalogoArticuloModel: CatalogoArticuloModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}catArticulo/create`, catalogoArticuloModel, this.getHeaders());
  }

  update(catalogoArticuloModel: CatalogoArticuloModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}catArticulo/update`, catalogoArticuloModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}