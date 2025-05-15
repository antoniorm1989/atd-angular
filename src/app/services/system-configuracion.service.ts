import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SystemConfigurationModel } from '../models/system-configuration-model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SistemaConfigurationService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<SystemConfigurationModel[]> {
    return this.http.get<SystemConfigurationModel[]>(`${environment.apiUrl}/api/systemConfiguration/getAll`);
  }

  updateAll(configs: SystemConfigurationModel[]): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/api/systemConfiguration/updateAll`, configs, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    };
  }
}
