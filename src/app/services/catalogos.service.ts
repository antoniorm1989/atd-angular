import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CatalogoCityModel, CatalogoCountryModel, CatalogoFormaPagoModel, CatalogoMetodoPagoModel, CatalogoMonedaModel, CatalogoObjetoImpuestoModel, CatalogoProductoServicioModel, CatalogoRegimenFiscalModel, CatalogoStateModel, CatalogoUnidadMedidaModel, CatalogoUsoCfdiModel } from '../models/catalogos.model';

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

  getUsoCfdi(): Observable<Array<CatalogoUsoCfdiModel>> {
    return this.http.get<Array<CatalogoUsoCfdiModel>>(`${environment.apiUrl}/api/catalogs/getUsoCfdi`);
  }

  getFormaPagoById(bancarizado: number): Observable<Array<CatalogoFormaPagoModel>> {
    return this.http.get<Array<CatalogoFormaPagoModel>>(`${environment.apiUrl}/api/catalogs/getFormaPagoById/${bancarizado}`);
  }

  getMetodoPago(): Observable<Array<CatalogoMetodoPagoModel>> {
    return this.http.get<Array<CatalogoMetodoPagoModel>>(`${environment.apiUrl}/api/catalogs/getMetodoPago`);
  }

  getObjetoImpuesto(): Observable<Array<CatalogoObjetoImpuestoModel>> {
    return this.http.get<Array<CatalogoObjetoImpuestoModel>>(`${environment.apiUrl}/api/catalogs/getObjetoImpuesto`);
  }

  getProductoServicio(): Observable<Array<CatalogoProductoServicioModel>> {
    return this.http.get<Array<CatalogoProductoServicioModel>>(`${environment.apiUrl}/api/catalogs/getProductoServicio`);
  }

  getUnidadMedida(): Observable<Array<CatalogoUnidadMedidaModel>> {
    return this.http.get<Array<CatalogoUnidadMedidaModel>>(`${environment.apiUrl}/api/catalogs/getUnidadMedida`);
  }

  getMonedas(): Observable<CatalogoMonedaModel[]> {
    return this.http.get<CatalogoMonedaModel[]>(`${environment.apiUrl}/api/catalogs/getMonedas`);
  }

}