import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { AlmacenComponent } from './components/almacen/almacen.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
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

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AlmacenComponent,
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
    MessageComponent
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
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
