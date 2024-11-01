import { Component } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent {

  catalogos = [
    { cat: 'almacenes', text: 'Artículos', icon: 'fa-solid fa-box-archive', href: 'articulos', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { cat: 'almacenes', text: 'Almacen', icon: 'fa-regular fa-square', href: 'almacenes', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },
    { cat: 'almacenes', text: 'Categoría Artículo', icon: 'fa-solid fa-layer-group', href: 'categoria-articulos', style: {'background-color' : '#000'}, styleCircle: {'color' : '#000'} },

    { cat: 'ventas', text: 'Clientes', icon: 'fa-solid fa-user-group', href: 'clientes', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },

    { cat: 'compras', text: 'Proveedores', icon: 'fa-solid fa-people-group', href: 'proveedores', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },
    
    { cat: 'configuracion', text: 'Sucursal', icon: 'fa-regular fa-building', href: 'sucursales', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { cat: 'configuracion', text: 'Roles', icon: 'fa-solid fa-users', href: 'roles', style: {'background-color' : '#000'}, styleCircle: {'color' : '#000'} },
    { cat: 'configuracion', text: 'Usuarios', icon: 'fa-solid fa-user', href: 'usuarios', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} }
  ];

  menu = "";

  constructor(private userService: UserService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/almacenes/catalogos') {
        this.catalogos = this.catalogos.filter(c => c.cat.includes('almacenes'));
        this.menu = "Almacenes";
      }
      else if (event instanceof NavigationEnd && event.url == '/venta/catalogos') {
        this.catalogos = this.catalogos.filter(c => c.cat.includes('ventas'));
        this.menu = "Ventas";
      }
      else if (event instanceof NavigationEnd && event.url == '/compras/catalogos') {
        this.catalogos = this.catalogos.filter(c => c.cat.includes('compras'));
        this.menu = "Compras";
      }
      else if (event instanceof NavigationEnd && event.url == '/configuracion/catalogos') {
        this.catalogos = this.catalogos.filter(c => c.cat.includes('configuracion'));
        this.menu = "Configuración";
      }
    });
  }

}
