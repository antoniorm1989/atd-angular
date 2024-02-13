import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CatalogoCityModel, CatalogoStateModel } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  constructor(private http: HttpClient) {
  }

  getStates(): Observable<Array<CatalogoStateModel>> {
    return this.http.get<Array<CatalogoStateModel>>(`${environment.apiUrl}/api/catalogs/getStates`);
  }

  getCitiesByState(state: string): Observable<Array<CatalogoCityModel>> {
    return this.http.get<Array<CatalogoCityModel>>(`${environment.apiUrl}/api/catalogs/getCities/${state}`);
  }
}