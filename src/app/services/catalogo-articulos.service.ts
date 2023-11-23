import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoArticuloModel } from '../models/catalogo-articulo.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogoArticuloService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoArticuloModel>> {
    return this.http.get<Array<CatalogoArticuloModel>>(`${environment.apiUrl}articulo/getAll`);
  }

  getById(id: number): Observable<CatalogoArticuloModel> {
    return this.http.get<CatalogoArticuloModel>(`${environment.apiUrl}articulo/getById/${id}`);
  }

  create(catalogoArticuloModel: CatalogoArticuloModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}articulo/create`, catalogoArticuloModel, this.getHeaders());
  }

  update(catalogoArticuloModel: CatalogoArticuloModel): Observable<any> {
    return this.http.put<void>(`${environment.apiUrl}articulo/update`, catalogoArticuloModel, this.getHeaders());
  }

  uploadPhoto(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}articulo/uploadPhoto/${id}`, formData, this.getHeadersFile());
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