import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { InventorySucursalModel } from 'src/app/models/inventory-sucursal.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { CatalogoSucursalModel } from 'src/app/models/catalogo-sucursal.model';
import { CatalogoSucursalesService } from 'src/app/services/catalogo-sucursales.service';
import { InventorySucursalService } from 'src/app/services/inventory_sucursal.service';

@Component({
  selector: 'app-inventory-sucursal-list',
  templateUrl: './inventory-sucursal-list.component.html',
  styleUrls: ['./inventory-sucursal-list.component.css']
})

export class InventorySucursalListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['part_number', 'description', 'category', 'stock', 'minimum_stock', 'maximum_stock', 'user', 'actions'];
  dataSource = new MatTableDataSource<InventorySucursalModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataLoaded = false;

  selectedSucursal: CatalogoSucursalModel | null = null;
  sucursales: CatalogoSucursalModel[] = [];

  constructor(private inventorySucursalService: InventorySucursalService, private catalogoSucursalesService: CatalogoSucursalesService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/inventario-sucursal' && !this.dataLoaded) {
        this.catalogoSucursalesService.getAll().subscribe({
          next: (data) => {
            this.sucursales = data;
            if (data.length > 0)
              this.selectedSucursal = data[0];
            this.onSucursalChange(null);
          },
          error: (e) => {
          }
        });
      }
    });
  }

  onSucursalChange(event: any) {
    this.inventorySucursalService.getInventoryBySucursal(this.selectedSucursal!.id).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.hasRecords = true;
          this.dataSource = new MatTableDataSource<InventorySucursalModel>(data);
          this.dataSource.paginator = this.paginator;
          this.dataLoaded = true;
        } else
          this.hasRecords = false;
      },
      error: (e) => {
      }
    });
  }

  getUserName(name: string, last_name: string): string {
    if (name && last_name)
      return name[0].toUpperCase() + last_name[0].toUpperCase();
    else return '';
  }


  onNew() {
    this.router.navigate(['inventario-sucursal/entrada/', this.selectedSucursal!.id]);
  }

  onView(id: string) {
    this.router.navigate(['inventario-sucursal/entrada/', this.selectedSucursal!.id, id]);
  }

  onViewHistory(id: string) {
    this.router.navigate(['inventario-sucursal/historial-sucursal/', id]);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  getPathPhoto(photo: string): string {
    return `${environment.apiUrl}/images/articulos/${photo}`
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }
}
