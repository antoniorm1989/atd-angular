import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CatalogoCityModel, CatalogoCountryModel, CatalogoRegimenFiscalModel, CatalogoStateModel } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {

  constructor(private http: HttpClient) {
  }

  getCountries(): Observable<Array<CatalogoCountryModel>> {
    return this.http.get<Array<CatalogoCountryModel>>(`${environment.apiUrl}/api/catalogs/getCountries`);
  }

  getStatesByCountry(country: string): Observable<Array<CatalogoStateModel>> {
    return this.http.get<Array<CatalogoStateModel>>(`${environment.apiUrl}/api/catalogs/getStates/${country}`);
  }

  getCitiesByState(state: string): Observable<Array<CatalogoCityModel>> {
    return this.http.get<Array<CatalogoCityModel>>(`${environment.apiUrl}/api/catalogs/getCities/${state}`);
  }

  getRegimenensFiscales(): Observable<Array<CatalogoRegimenFiscalModel>> {
    return this.http.get<Array<CatalogoRegimenFiscalModel>>(`${environment.apiUrl}/api/catalogs/getRegimenesFiscales`);
  }
}