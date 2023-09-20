import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private userService: UserService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.userService.isTokenValid()) {
            if (route.routeConfig!.path == 'login') {
                this.router.navigate(['/almacen'], { queryParams: { returnUrl: state.url } });
                return false;
            } else
                return true;
        } else {
            if (route.routeConfig!.path == 'login') {
                return true;
            }
            else {
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }
        }
    }

}