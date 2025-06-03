import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoAlmacenModel } from '../models/catalogo-almacen.model';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CatalogoAlmacenesService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoAlmacenModel>> {
    return this.http.get<Array<CatalogoAlmacenModel>>(`${environment.apiUrl}/api/almacen/getAll`);
  }

  getAllPaginado(page: number, limit: number, sort: string = 'nombre', order: string = 'asc'): Observable<{ data: Array<CatalogoAlmacenModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    return this.http.get<{ data: Array<CatalogoAlmacenModel>, total: number }>(
      `${environment.apiUrl}/api/almacen/getAllPaginated`,
      { params }
    );
  }

  getById(id: number): Observable<CatalogoAlmacenModel> {
    return this.http.get<CatalogoAlmacenModel>(`${environment.apiUrl}/api/almacen/getById/${id}`);
  }

  create(catalogoAlmacenModel: CatalogoAlmacenModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/almacen/create`, catalogoAlmacenModel, this.getHeaders());
  }

  update(catalogoAlmacenModel: CatalogoAlmacenModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/almacen/update`, catalogoAlmacenModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}