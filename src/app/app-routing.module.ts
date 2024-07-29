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
import { CatalogoClientesComponent } from './components/catalogos/clientes/cliente/catalogo-clientes.component';
import { CatalogoClientesListComponent } from './components/catalogos/clientes/catalogo-clientes-list.component';
import { VentasListComponent } from './components/ventas/ventas-list.component';
import { VentaComponent } from './components/ventas/venta/venta.component';
import { CatalogoProveedoresListComponent } from './components/catalogos/proveedores/catalogo-proveedores-list.component';
import { CatalogoProveedoresComponent } from './components/catalogos/proveedores/proveedor/catalogo-proveedores.component';
import { CatalogoUsuariosListComponent } from './components/catalogos/usuarios/catalogo-usuarios-list.component';
import { CatalogoUsuariosComponent } from './components/catalogos/usuarios/usuario/catalogo-usuarios.component';
import { ChangePasswordComponent } from './components/login/changepassword/changepassword.component';

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
  { path: 'catalogos/clientes', component: CatalogoClientesListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/clientes/detail', component: CatalogoClientesComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/clientes/detail/:id', component: CatalogoClientesComponent, canActivate: [AuthGuard] },
  { path: 'ventas', component: VentasListComponent, canActivate: [AuthGuard] },
  { path: 'ventas/detail', component: VentaComponent, canActivate: [AuthGuard]},
  { path: 'ventas/detail/:ventaId', component: VentaComponent, canActivate: [AuthGuard]},
  { path: 'catalogos/proveedores', component: CatalogoProveedoresListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/proveedores/detail', component: CatalogoProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/proveedores/detail/:id', component: CatalogoProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/usuarios', component: CatalogoUsuariosListComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/usuarios/detail', component: CatalogoUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'catalogos/usuarios/detail/:id', component: CatalogoUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'login/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
