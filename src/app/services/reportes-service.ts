import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  obtenerFacturas(payload: Record<string, any>): Observable<any[]> {
    let params = new HttpParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<any[]>(`${this.apiUrl}/facturas`, { params });
  }

  exportarFacturasExcel(payload: Record<string, any>): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/facturas/exportar`, payload, {
      responseType: 'blob',
    });
  }
}