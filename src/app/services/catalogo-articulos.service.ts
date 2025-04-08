import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArticuloGroup, CatalogoArticuloModel } from '../models/catalogo-articulo.model';
import { environment } from 'src/environments/environment';
import { CatalogoMonedaModel } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoArticuloService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoArticuloModel>> {
    return this.http.get<Array<CatalogoArticuloModel>>(`${environment.apiUrl}/api/articulo/getAll`);
  }

  getAllByCategory(categoryId: number): Observable<Array<CatalogoArticuloModel>> {
    return this.http.get<Array<CatalogoArticuloModel>>(`${environment.apiUrl}/api/articulo/getAllByCategory/${categoryId}`);
  }

  getById(id: number): Observable<CatalogoArticuloModel> {
    return this.http.get<CatalogoArticuloModel>(`${environment.apiUrl}/api/articulo/getById/${id}`);
  }

  create(catalogoArticuloModel: CatalogoArticuloModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/articulo/create`, catalogoArticuloModel, this.getHeaders());
  }

  update(catalogoArticuloModel: CatalogoArticuloModel): Observable<any> {
    return this.http.put<void>(`${environment.apiUrl}/api/articulo/update`, catalogoArticuloModel, this.getHeaders());
  }

  uploadPhoto(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/articulo/uploadPhoto/${id}`, formData, this.getHeadersFile());
  }

  getAllGroupedByCategory(): Observable<ArticuloGroup[]> {
    return this.http.get<ArticuloGroup[]>(`${environment.apiUrl}/api/articulo/getAllGroupedByCategory`);
  }

  getAllGroupedByCategoryByAlmacen(almacenId: number, clienteId: number): Observable<ArticuloGroup[]> {
    return this.http.get<ArticuloGroup[]>(`${environment.apiUrl}/api/articulo/getAllGroupedByCategoryByAlmacen/${almacenId}/${clienteId}`);
  }

  getMonedas(): Observable<CatalogoMonedaModel[]> {
    return this.http.get<CatalogoMonedaModel[]>(`${environment.apiUrl}/api/articulo/getCatalogoMonedas`);
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }

  private getHeadersFile() {
    return {
      headers: {
        //'Content-Type': 'multipart/form-data',
      }
    }
  }
}