import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CatalogoCityModel, CatalogoStateModel } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  constructor(private http: HttpClient) {
  }

  getStates(): Observable<Array<CatalogoStateModel>> {
    return this.http.get<Array<CatalogoStateModel>>(`http://localhost:3000/catalogs/getStates`);
  }

  getCitiesByState(state: string): Observable<Array<CatalogoCityModel>> {
    return this.http.get<Array<CatalogoCityModel>>(`http://localhost:3000/catalogs/getCities/${state}`);
  }
}