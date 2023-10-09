import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { CatalogoSucursalModel } from '../models/catalogo-sucursal.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoSucursalesService {

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<Array<CatalogoSucursalModel>> {
    return this.http.get<Array<CatalogoSucursalModel>>(`http://localhost:3000/sucursal/getAll`);
  }

  getById(id: number): Observable<CatalogoSucursalModel> {
    return this.http.get<CatalogoSucursalModel>(`http://localhost:3000/sucursal/getById/${id}`);
  }

  create(catalogoSucursalModel: CatalogoSucursalModel): Observable<void> {
    return this.http.post<void>(`http://localhost:3000/sucursal/create`, catalogoSucursalModel, this.getHeaders());
  }

  update(catalogoSucursalModel: CatalogoSucursalModel): Observable<void> {
    return this.http.put<void>(`http://localhost:3000/sucursal/update`, catalogoSucursalModel, this.getHeaders());
  }

  private getHeaders() {
    return {
      headers: {
        'Content-type': 'application/json'
      }
    }
  }
}