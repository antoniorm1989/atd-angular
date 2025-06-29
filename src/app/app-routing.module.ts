import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogoAlmacenesComponent } from './components/catalogos/almacenes/almacen/catalogo-almacenes.component';
import { CatalogoAlmacenesListComponent } from './components/catalogos/almacenes/catalogo-almacenes-list.component';
import { CatalogosComponent } from './components/catalogos/catalogos.component';
import { CatalogoRolesListComponent } from './components/catalogos/roles/catalogo-roles-list.component';
import { CatalogoSucursalesListComponent } from './components/catalogos/sucursales/catalogo-sucursales-list.component';
import { CatalogoSucursalesComponent } from './components/catalogos/sucursales/sucursal/catalogo-sucursales.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { CatalogoRolesComponent } from './components/catalogos/roles/rol/catalogo-roles.component';
import { CatalogoCategoriaArticuloListComponent } from './components/catalogos/categoria_articulos/catalogo-categoria-articulo-list.component';
import { CatalogoCategoriaArticuloComponent } from './components/catalogos/categoria_articulos/categoria_articulo/catalogo-categoria-articulo.component';
import { CatalogoArticuloListComponent } from './components/catalogos/articulos/catalogo-articulo-list.component';
import { CatalogoArticuloComponent } from './components/catalogos/articulos/articulo/catalogo-articulo.component';
import { InventoryAlmacenListComponent } from './components/inventory-almacen/inventory-almacen-list.component';
import { EntradaAlmacenComponent } from './components/inventory-almacen/entrada/entrada-almacen.component';
import { HistorialAlmacenComponent } from './components/inventory-almacen/historial/historial-almacen.component';
import { CatalogoClientesComponent } from './components/catalogos/clientes/cliente/catalogo-clientes.component';
import { CatalogoClientesListComponent } from './components/catalogos/clientes/catalogo-clientes-list.component';
import { VentasListComponent } from './components/ventas/ventas-list.component';
import { VentaComponent } from './components/ventas/venta/venta.component';
import { CatalogoProveedoresListComponent } from './components/catalogos/proveedores/catalogo-proveedores-list.component';
import { CatalogoProveedoresComponent } from './components/catalogos/proveedores/proveedor/catalogo-proveedores.component';
import { CatalogoUsuariosListComponent } from './components/catalogos/usuarios/catalogo-usuarios-list.component';
import { CatalogoUsuariosComponent } from './components/catalogos/usuarios/usuario/catalogo-usuarios.component';
import { ChangePasswordComponent } from './components/login/changepassword/changepassword.component';
import { OrdenesCompraListComponent } from './components/ordenes-compra/orden-compra-list.component';
import { SistemaConfiguracionComponent } from './components/configuracion/sistema-configuracion.component';
import { CatalogoCuentaBancariaListComponent } from './components/catalogos/cuenta_bancaria/catalogo-cuenta-bancaria-list.component';
import { CatalogoCuentaBancariaComponent } from './components/catalogos/cuenta_bancaria/cuenta_bancaria_detail/catalogo-cuenta-bancaria-detail..component';

const routes: Routes = [
  { path: '', redirectTo: '/inventario-almacen', pathMatch: 'full' }, // Redirect to login by default
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard]}, // Login route
  { path: 'login/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard]},
  
  //{ path: 'inventario-sucursal', component: InventorySucursalListComponent, canActivate: [AuthGuard] },
  //{ path: 'inventario-sucursal/entrada/:sucursalId', component: EntradaSucursalComponent, canActivate: [AuthGuard] },
  //{ path: 'inventario-sucursal/entrada/:sucursalId/:articuloId', component: EntradaSucursalComponent, canActivate: [AuthGuard] },
  //{ path: 'inventario-sucursal/historial-sucursal/:id', component: HistorialSucursalComponent, canActivate: [AuthGuard] },
  //{ path: 'sucursales', component: SuscursalesComponent, canActivate: [AuthGuard] },

  // Alamacenes
  { path: 'inventario-almacen', component: InventoryAlmacenListComponent, canActivate: [AuthGuard] },
  { path: 'inventario-almacen/entrada/:almacenId', component: EntradaAlmacenComponent, canActivate: [AuthGuard]},
  { path: 'inventario-almacen/entrada/:almacenId/:articuloId', component: EntradaAlmacenComponent, canActivate: [AuthGuard] },
  { path: 'inventario-almacen/historial-almacen/:id', component: HistorialAlmacenComponent, canActivate: [AuthGuard] },
  // Alamecens Catalogos
  { path: 'almacenes/catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/almacenes', component: CatalogoAlmacenesListComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/almacenes/detail', component: CatalogoAlmacenesComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/almacenes/detail/:id', component: CatalogoAlmacenesComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/categoria-articulos', component: CatalogoCategoriaArticuloListComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/categoria-articulos/detail', component: CatalogoCategoriaArticuloComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/categoria-articulos/detail/:id', component: CatalogoCategoriaArticuloComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/articulos', component: CatalogoArticuloListComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/articulos/detail', component: CatalogoArticuloComponent, canActivate: [AuthGuard] },
  { path: 'almacenes/catalogos/articulos/detail/:id', component: CatalogoArticuloComponent, canActivate: [AuthGuard] },

  // Ventas
  { path: 'ventas', component: VentasListComponent, canActivate: [AuthGuard] },
  { path: 'ventas/detail', component: VentaComponent, canActivate: [AuthGuard]},
  { path: 'ventas/detail/:ventaId', component: VentaComponent, canActivate: [AuthGuard]},

  // Ventas Catalogos
  { path: 'venta/catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'venta/catalogos/clientes', component: CatalogoClientesListComponent, canActivate: [AuthGuard] },
  { path: 'venta/catalogos/clientes/detail', component: CatalogoClientesComponent, canActivate: [AuthGuard] },
  { path: 'venta/catalogos/clientes/detail/:id', component: CatalogoClientesComponent, canActivate: [AuthGuard] },

  { path: 'venta/catalogos/cuenta-bancaria', component: CatalogoCuentaBancariaListComponent, canActivate: [AuthGuard] },
  { path: 'venta/catalogos/cuenta-bancaria/detail', component: CatalogoCuentaBancariaComponent, canActivate: [AuthGuard] },
  { path: 'venta/catalogos/cuenta-bancaria/detail/:id', component: CatalogoCuentaBancariaComponent, canActivate: [AuthGuard] },

  // Ordens de compra
  { path: 'orden-compra', component: OrdenesCompraListComponent, canActivate: [AuthGuard] },
  { path: 'orden-compra/detail', component: VentaComponent, canActivate: [AuthGuard]},
  { path: 'orden-compra/detail/:ordenesCompraId', component: VentaComponent, canActivate: [AuthGuard]},

  // Catalogos compras
  { path: 'compras/catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'compras/catalogos/proveedores', component: CatalogoProveedoresListComponent, canActivate: [AuthGuard] },
  { path: 'compras/catalogos/proveedores/detail', component: CatalogoProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'compras/catalogos/proveedores/detail/:id', component: CatalogoProveedoresComponent, canActivate: [AuthGuard] },

  // Catalogos configuraciones
  { path: 'configuracion/catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/sucursales', component: CatalogoSucursalesListComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/sucursales/detail', component: CatalogoSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/sucursales/detail/:id', component: CatalogoSucursalesComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/roles', component: CatalogoRolesListComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/roles/detail', component: CatalogoRolesComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/roles/detail/:id', component: CatalogoRolesComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/usuarios', component: CatalogoUsuariosListComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/usuarios/detail', component: CatalogoUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'configuracion/catalogos/usuarios/detail/:id', component: CatalogoUsuariosComponent, canActivate: [AuthGuard] },

  // Configuracion
  { path: 'configuracion/sistema', component: SistemaConfiguracionComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
