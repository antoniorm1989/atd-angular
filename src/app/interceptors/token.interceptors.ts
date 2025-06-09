import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class TokenExpiredInterceptor implements HttpInterceptor {

  constructor(private router: Router, private jwtHelper: JwtHelperService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = JSON.parse(localStorage.getItem('user_data') || '{}')?.token;

    // Verificar si el token existe y ya expiró
    if (token && this.jwtHelper.isTokenExpired(token)) {
      localStorage.removeItem('user_data');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Token expirado'));
    }

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Manejar error 401 por si el backend también lo devuelve
          localStorage.removeItem('user_data');
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}