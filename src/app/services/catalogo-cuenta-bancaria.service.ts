import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpParams } from '@angular/common/http';
import { CatalogoCuentaBancariaModel } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoCuentaBancariaService {

  constructor(private http: HttpClient) {
  }

  getAll(page: number, limit: number, sort: string = 'nombre', order: string = 'asc', search: string = ''): Observable<{ data: Array<CatalogoCuentaBancariaModel>, total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ data: Array<CatalogoCuentaBancariaModel>, total: number }>(
      `${environment.apiUrl}/api/cuentaBancaria/getAll`,
      { params }
    );
  }

  getById(id: number): Observable<CatalogoCuentaBancariaModel> {
    return this.http.get<CatalogoCuentaBancariaModel>(`${environment.apiUrl}/api/cuentaBancaria/getById/${id}`);
  }

  create(CatalogoCuentaBancariaModel: CatalogoCuentaBancariaModel): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/api/cuentaBancaria/create`, CatalogoCuentaBancariaModel, this.getHeaders());
  }

  update(CatalogoCuentaBancariaModel: CatalogoCuentaBancariaModel): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/cuentaBancaria/update`, CatalogoCuentaBancariaModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}