import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
}