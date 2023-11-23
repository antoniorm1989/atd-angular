import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoCategoriaArticuloModel } from '../models/catalogo-categoria-articulo.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogoCategoriaArticuloService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoCategoriaArticuloModel>> {
    return this.http.get<Array<CatalogoCategoriaArticuloModel>>(`${environment.apiUrl}catArticulo/getAll`);
  }

  getById(id: number): Observable<CatalogoCategoriaArticuloModel> {
    return this.http.get<CatalogoCategoriaArticuloModel>(`${environment.apiUrl}catArticulo/getById/${id}`);
  }

  create(CatalogoCategoriaArticuloModel: CatalogoCategoriaArticuloModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}catArticulo/create`, CatalogoCategoriaArticuloModel, this.getHeaders());
  }

  update(CatalogoCategoriaArticuloModel: CatalogoCategoriaArticuloModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}catArticulo/update`, CatalogoCategoriaArticuloModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}