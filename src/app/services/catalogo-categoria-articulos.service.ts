import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoCategoriaArticuloModel } from '../models/catalogo-categoria-articulo.model';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CatalogoCategoriaArticuloService {

  constructor(private http: HttpClient) {
  }

  getAll(page: number, limit: number, sort: string = 'nombre', order: string = 'asc'): Observable<{ data: Array<CatalogoCategoriaArticuloModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    return this.http.get<{ data: Array<CatalogoCategoriaArticuloModel>, total: number }>(
      `${environment.apiUrl}/api/catArticulo/getAll`,
      { params }
    );
  }

  getById(id: number): Observable<CatalogoCategoriaArticuloModel> {
    return this.http.get<CatalogoCategoriaArticuloModel>(`${environment.apiUrl}/api/catArticulo/getById/${id}`);
  }

  create(CatalogoCategoriaArticuloModel: CatalogoCategoriaArticuloModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/catArticulo/create`, CatalogoCategoriaArticuloModel, this.getHeaders());
  }

  update(CatalogoCategoriaArticuloModel: CatalogoCategoriaArticuloModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/catArticulo/update`, CatalogoCategoriaArticuloModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}