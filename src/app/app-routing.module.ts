import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlmacenComponent } from './components/almacen/almacen.component';
import { CatalogoAlmacenesComponent } from './components/catalogos/almacenes/almacen/catalogo-almacenes.component';
import { CatalogoAlmacenesListComponent } from './components/catalogos/almacenes/catalogo-almacenes-list.component';
import { CatalogosComponent } from './components/catalogos/catalogos.component';
import { CatalogoSucursalesListComponent } from './components/catalogos/sucursales/catalogo-sucursales-list.component';
import { CatalogoSucursalesComponent } from './components/catalogos/sucursales/sucursal/catalogo-sucursales.component';
import { LoginComponent } from './components/login/login.component';
import { SuscursalesComponent } from './components/suscursales/suscursales.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/almacen', pathMatch: 'full' }, // Redirect to login by default
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard]}, // Login route
  { path: 'almacen', component: AlmacenComponent, canActivate: [AuthGuard] },
  { path: 'sucursales', component: SuscursalesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/sucursales', component: CatalogoSucursalesListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/sucursales/detail', component: CatalogoSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/sucursales/detail/:id', component: CatalogoSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/almacenes', component: CatalogoAlmacenesListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/almacenes/detail', component: CatalogoAlmacenesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/almacenes/detail/:id', component: CatalogoAlmacenesComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
