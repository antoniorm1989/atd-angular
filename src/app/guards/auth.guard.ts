import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {

    constructor(
        private router: Router,
        private userService: UserService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userService.isTokenValid()) {
            let userData = JSON.parse(localStorage.getItem('user_data') || '{"isPasswordTemp":0}');

            if (userData.isPasswordTemp == 1) {
                // Si la contraseña es temporal, redirigir a la página de cambio de contraseña
                if (route.routeConfig!.path !== 'login/change-password') {
                    this.router.navigate(['/login/change-password'], { queryParams: { returnUrl: state.url } });
                    return false;
                }
                return true;
            }

            // Si el usuario está logueado y la contraseña no es temporal
            if (route.routeConfig!.path == 'login' || route.routeConfig!.path == 'login/change-password') {
                this.router.navigate(['/inventario-almacen'], { queryParams: { returnUrl: state.url } });
                return false;
            }

            return true;
        } else {
            // Si no está logueado
            if (route.routeConfig!.path == 'login') {
                return true;
            } else {
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }
        }
    }

}