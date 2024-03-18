import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent {

  catalogos = [
    { text: 'Sucursal', icon: 'fa-regular fa-building', href: 'sucursales', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { text: 'Almacen', icon: 'fa-regular fa-square', href: 'almacenes', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },
    { text: 'Roles', icon: 'fa-solid fa-users', href: 'roles', style: {'background-color' : '#000'}, styleCircle: {'color' : '#000'} },
    { text: 'Usuarios', icon: 'fa-solid fa-user', href: 'cat-sucursal', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { text: 'Clientes', icon: 'fa-solid fa-user-group', href: 'clientes', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },
    { text: 'Categoría Artículo', icon: 'fa-solid fa-layer-group', href: 'categoria-articulos', style: {'background-color' : '#000'}, styleCircle: {'color' : '#000'} },
    { text: 'Artículos', icon: 'fa-solid fa-box-archive', href: 'articulos', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { text: 'Estatus', icon: 'fa-regular fa-star', href: 'cat-sucursal', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} }
  ];

}
