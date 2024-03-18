import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CatalogoClienteModel } from '../models/catalogo-cliente.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoClientesService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoClienteModel>> {
    return this.http.get<Array<CatalogoClienteModel>>(`${environment.apiUrl}/api/cliente/getAll`);
  }

  getById(id: number): Observable<CatalogoClienteModel> {
    return this.http.get<CatalogoClienteModel>(`${environment.apiUrl}/api/cliente/getById/${id}`);
  }

  create(catalogoClienteModel: CatalogoClienteModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/cliente/create`, catalogoClienteModel, this.getHeaders());
  }

  update(catalogoClienteModel: CatalogoClienteModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/cliente/update`, catalogoClienteModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}