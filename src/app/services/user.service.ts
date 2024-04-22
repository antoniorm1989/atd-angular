import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private tokenSubject: BehaviorSubject<User | null>;
  public token: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {
    this.tokenSubject = new BehaviorSubject<User | null>(JSON.parse(localStorage.getItem('user-token')!));
    this.token = this.tokenSubject.asObservable();
  }

  public get tokenValue(): User | null {
    return this.tokenSubject.value;
  }

  getAll(): Observable<Array<User>> {
    return this.http.get<Array<User>>(`${environment.apiUrl}/api/auth/getAll`);
  }

  login(email: string, password: string) {

    return this.http.post<User>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        map(token => {
          const userToken: User = token;

          localStorage.setItem('user-token', JSON.stringify(userToken));
          this.tokenSubject.next(userToken);

          return userToken;
        })
      );
  }

  logout() {
    localStorage.removeItem('user-token');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  isTokenValid(): boolean {
    if (this.tokenValue && this.tokenValue.token)
      return !this.jwtHelper.isTokenExpired(this.tokenValue?.token);
    else
      return false;
  }

}