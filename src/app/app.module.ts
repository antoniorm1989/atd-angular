import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SuscursalesComponent } from './components/suscursales/suscursales.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { CatalogosComponent } from './components/catalogos/catalogos.component';
import { CommonModule } from '@angular/common';
import { CatalogoSucursalesListComponent } from './components/catalogos/sucursales/catalogo-sucursales-list.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CatalogoSucursalesComponent } from './components/catalogos/sucursales/sucursal/catalogo-sucursales.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogoAlmacenesListComponent } from './components/catalogos/almacenes/catalogo-almacenes-list.component';
import { CatalogoAlmacenesComponent } from './components/catalogos/almacenes/almacen/catalogo-almacenes.component';
import { CatalogoRolesListComponent } from './components/catalogos/roles/catalogo-roles-list.component';
import { CatalogoRolesComponent } from './components/catalogos/roles/rol/catalogo-roles.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { CatalogoCategoriaArticuloListComponent } from './components/catalogos/categoria_articulos/catalogo-categoria-articulo-list.component';
import { CatalogoCategoriaArticuloComponent } from './components/catalogos/categoria_articulos/categoria_articulo/catalogo-categoria-articulo.component';
import { CatalogoArticuloListComponent } from './components/catalogos/articulos/catalogo-articulo-list.component';
import { CatalogoArticuloComponent } from './components/catalogos/articulos/articulo/catalogo-articulo.component';
import { MessageComponent } from './components/genericos/snack-message.component';
import { InventoryAlmacenListComponent } from './components/inventory-almacen/inventory-almacen-list.component';
import { EntradaAlmacenComponent } from './components/inventory-almacen/entrada/entrada-almacen.component';
import { HistorialAlmacenComponent } from './components/inventory-almacen/historial/historial-almacen.component';
import { MatDialogModule } from '@angular/material/dialog';
import { InventorySucursalListComponent } from './components/inventory-sucursal/inventory-sucursal-list.component';
import { EntradaSucursalComponent } from './components/inventory-sucursal/entrada/entrada-sucursal.component';
import { HistorialSucursalComponent } from './components/inventory-sucursal/historial/historial-sucursal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CatalogoClientesListComponent } from './components/catalogos/clientes/catalogo-clientes-list.component';
import { ArticuloClienteModalComponent, CatalogoClientesComponent } from './components/catalogos/clientes/cliente/catalogo-clientes.component';
import { BarcodeScannerComponent } from './components/genericos/barcodesScanner.component';
import { VentasListComponent } from './components/ventas/ventas-list.component';
import { ArticuloVentaModalComponent, VentaComponent } from './components/ventas/venta/venta.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { VentaArticuloComponent } from './components/ventas/venta/articulo/venta-articulo.component';
import { CatalogoProveedoresListComponent } from './components/catalogos/proveedores/catalogo-proveedores-list.component';
import { CatalogoProveedoresComponent } from './components/catalogos/proveedores/proveedor/catalogo-proveedores.component';
import { ClienteArticuloComponent } from './components/catalogos/clientes/cliente/articulo/cliente-articulo.component';
import { MatMenuModule } from '@angular/material/menu';
import { CatalogoUsuariosListComponent } from './components/catalogos/usuarios/catalogo-usuarios-list.component';
import { CatalogoUsuariosComponent, EditarPasswordModalComponent } from './components/catalogos/usuarios/usuario/catalogo-usuarios.component';
import { UpdatePasswordComponent } from './components/catalogos/usuarios/usuario/password/update-password.component';
import { ChangePasswordComponent } from './components/login/changepassword/changepassword.component';
import { OrdenesCompraListComponent } from './components/ordenes-compra/orden-compra-list.component';
import { ArticuloOrdenCompraModalComponent, OrdenCompraComponent } from './components/ordenes-compra/orden-compra/orden-compra.component';
import { OrdenCompraArticuloComponent } from './components/ordenes-compra/orden-compra/articulo/orden-compra-articulo.component';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SuscursalesComponent,
    CatalogosComponent,
    CatalogoSucursalesListComponent,
    CatalogoSucursalesComponent,
    CatalogoAlmacenesListComponent,
    CatalogoAlmacenesComponent,
    CatalogoRolesListComponent,
    CatalogoRolesComponent,
    CatalogoCategoriaArticuloListComponent,
    CatalogoCategoriaArticuloComponent,
    CatalogoArticuloListComponent,
    CatalogoArticuloComponent,
    MessageComponent,
    InventoryAlmacenListComponent,
    EntradaAlmacenComponent,
    HistorialAlmacenComponent,
    InventorySucursalListComponent,
    EntradaSucursalComponent,
    HistorialSucursalComponent,
    CatalogoClientesListComponent,
    CatalogoClientesComponent,
    VentasListComponent,
    VentaComponent,
    VentaArticuloComponent,
    ArticuloVentaModalComponent,
    ArticuloClienteModalComponent,
    CatalogoProveedoresListComponent,
    CatalogoProveedoresComponent,
    ClienteArticuloComponent,
    CatalogoUsuariosListComponent,
    CatalogoUsuariosComponent,
    UpdatePasswordComponent,
    EditarPasswordModalComponent,
    ChangePasswordComponent,
    OrdenesCompraListComponent,
    OrdenCompraComponent,
    ArticuloOrdenCompraModalComponent,
    OrdenCompraArticuloComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    MatTableModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
    MatExpansionModule,
    MatSelectModule,
    MatTabsModule,
    MatGridListModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatAutocompleteModule,
    BarcodeScannerComponent,
    MatDatepickerModule,
    MatRadioModule,
    MatNativeDateModule,
    MatMenuModule
  ],
  providers:[
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
