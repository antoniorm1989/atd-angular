import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogoAlmacenesComponent } from './components/catalogos/almacenes/almacen/catalogo-almacenes.component';
import { CatalogoAlmacenesListComponent } from './components/catalogos/almacenes/catalogo-almacenes-list.component';
import { CatalogosComponent } from './components/catalogos/catalogos.component';
import { CatalogoRolesListComponent } from './components/catalogos/roles/catalogo-roles-list.component';
import { CatalogoSucursalesListComponent } from './components/catalogos/sucursales/catalogo-sucursales-list.component';
import { CatalogoSucursalesComponent } from './components/catalogos/sucursales/sucursal/catalogo-sucursales.component';
import { LoginComponent } from './components/login/login.component';
import { SuscursalesComponent } from './components/suscursales/suscursales.component';
import { AuthGuard } from './guards/auth.guard';
import { CatalogoRolesComponent } from './components/catalogos/roles/rol/catalogo-roles.component';
import { CatalogoCategoriaArticuloListComponent } from './components/catalogos/categoria_articulos/catalogo-categoria-articulo-list.component';
import { CatalogoCategoriaArticuloComponent } from './components/catalogos/categoria_articulos/categoria_articulo/catalogo-categoria-articulo.component';
import { CatalogoArticuloListComponent } from './components/catalogos/articulos/catalogo-articulo-list.component';
import { CatalogoArticuloComponent } from './components/catalogos/articulos/articulo/catalogo-articulo.component';
import { InventoryAlmacenListComponent } from './components/inventory-almacen/inventory-almacen-list.component';
import { EntradaAlmacenComponent } from './components/inventory-almacen/entrada/entrada-almacen.component';
import { HistorialAlmacenComponent } from './components/inventory-almacen/historial/historial-almacen.component';
import { InventorySucursalListComponent } from './components/inventory-sucursal/inventory-sucursal-list.component';
import { EntradaSucursalComponent } from './components/inventory-sucursal/entrada/entrada-sucursal.component';
import { HistorialSucursalComponent } from './components/inventory-sucursal/historial/historial-sucursal.component';

const routes: Routes = [
  { path: '', redirectTo: '/inventario-almacen', pathMatch: 'full' }, // Redirect to login by default
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard]}, // Login route
  { path: 'inventario-almacen', component: InventoryAlmacenListComponent, canActivate: [AuthGuard] },
  { path: 'inventario-almacen/entrada/:almacenId', component: EntradaAlmacenComponent, canActivate: [AuthGuard]},
  { path: 'inventario-almacen/entrada/:almacenId/:articuloId', component: EntradaAlmacenComponent, canActivate: [AuthGuard] },
  { path: 'inventario-almacen/historial-almacen/:id', component: HistorialAlmacenComponent, canActivate: [AuthGuard] },
  { path: 'inventario-sucursal', component: InventorySucursalListComponent, canActivate: [AuthGuard] },
  { path: 'inventario-sucursal/entrada/:sucursalId', component: EntradaSucursalComponent, canActivate: [AuthGuard] },
  { path: 'inventario-sucursal/entrada/:sucursalId/:articuloId', component: EntradaSucursalComponent, canActivate: [AuthGuard] },
  { path: 'inventario-sucursal/historial-sucursal/:id', component: HistorialSucursalComponent, canActivate: [AuthGuard] },
  { path: 'sucursales', component: SuscursalesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/sucursales', component: CatalogoSucursalesListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/sucursales/detail', component: CatalogoSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/sucursales/detail/:id', component: CatalogoSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/almacenes', component: CatalogoAlmacenesListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/almacenes/detail', component: CatalogoAlmacenesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/almacenes/detail/:id', component: CatalogoAlmacenesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/roles', component: CatalogoRolesListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/roles/detail', component: CatalogoRolesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/roles/detail/:id', component: CatalogoRolesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/categoria-articulos', component: CatalogoCategoriaArticuloListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/categoria-articulos/detail', component: CatalogoCategoriaArticuloComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/categoria-articulos/detail/:id', component: CatalogoCategoriaArticuloComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/articulos', component: CatalogoArticuloListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/articulos/detail', component: CatalogoArticuloComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/articulos/detail/:id', component: CatalogoArticuloComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
