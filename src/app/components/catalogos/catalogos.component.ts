import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent {

  catalogos = [
    { text: 'Sucursal', icon: 'fa-regular fa-building', href: 'cat-sucursal', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { text: 'Almacen', icon: 'fa-regular fa-square', href: 'cat-sucursal', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },
    { text: 'Roles', icon: 'fa-solid fa-users', href: 'cat-sucursal', style: {'background-color' : '#000'}, styleCircle: {'color' : '#000'} },
    { text: 'Usuarios', icon: 'fa-solid fa-user', href: 'cat-sucursal', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { text: 'Proveedores', icon: 'fa-solid fa-users-between-lines', href: 'cat-sucursal', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} },
    { text: 'Categoría Artículo', icon: 'fa-solid fa-layer-group', href: 'cat-sucursal', style: {'background-color' : '#000'}, styleCircle: {'color' : '#000'} },
    { text: 'Artículos', icon: 'fa-solid fa-box-archive', href: 'cat-sucursal', style: {'background-color' : '#00000099'}, styleCircle: {'color' : '#00000099'} },
    { text: 'Estatus', icon: 'fa-regular fa-star', href: 'cat-sucursal', style: {'background-color' : '#BA9400'}, styleCircle: {'color' : '#BA9400'} }
  ];

}
