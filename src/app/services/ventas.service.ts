import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VentaModel } from '../models/ventas.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<VentaModel>> {
    return this.http.get<Array<VentaModel>>(`${environment.apiUrl}/api/ventas/getAll`);
  }

  getById(id: number): Observable<VentaModel> {
    return this.http.get<VentaModel>(`${environment.apiUrl}/api/ventas/getById/${id}`);
  }

  create(ventaModel: VentaModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/create`, ventaModel, this.getHeaders());
  }

  update(ventaModel: VentaModel): Observable<any> {
    return this.http.post<void>(`${environment.apiUrl}/api/ventas/update`, ventaModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}