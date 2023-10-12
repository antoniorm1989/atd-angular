import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoAlmacenModel } from '../models/catalogo-almacen.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoAlmacenesService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoAlmacenModel>> {
    return this.http.get<Array<CatalogoAlmacenModel>>(`http://localhost:3000/almacen/getAll`);
  }

  getById(id: number): Observable<CatalogoAlmacenModel> {
    return this.http.get<CatalogoAlmacenModel>(`http://localhost:3000/almacen/getById/${id}`);
  }

  create(catalogoAlmacenModel: CatalogoAlmacenModel): Observable<void> {
    return this.http.post<void>(`http://localhost:3000/almacen/create`, catalogoAlmacenModel, this.getHeaders());
  }

  update(catalogoAlmacenModel: CatalogoAlmacenModel): Observable<void> {
    return this.http.put<void>(`http://localhost:3000/almacen/update`, catalogoAlmacenModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}