import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { InventoryAlmacenModel, InventoryAlmacenTransactionsModel } from 'src/app/models/inventory-almacen.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';

@Component({
  selector: 'app-inventory-almacen-list',
  templateUrl: './inventory-almacen-list.component.html',
  styleUrls: ['./inventory-almacen-list.component.css']
})

export class InventoryAlmacenListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['part_number', 'description', 'category', 'stock', 'minimum_stock', 'maximum_stock', 'user', 'actions'];
  dataSource = new MatTableDataSource<InventoryAlmacenModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataLoaded = false;

  selectedAlmacen: CatalogoAlmacenModel | null = null;
  almacenes: CatalogoAlmacenModel[] = [];

  constructor(private inventoryAlmacenService: InventoryAlmacenService, private catalogoAlmacenesService: CatalogoAlmacenesService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/inventario-almacen' && !this.dataLoaded) {
        this.catalogoAlmacenesService.getAll().subscribe({
          next: (data) => {
            this.almacenes = data;
            if (data.length > 0)
              this.selectedAlmacen = data[0];
            this.onAlmacenChange(null);
          },
          error: (e) => {
          }
        });
      }
    });
  }

  onAlmacenChange(event: any) {
    this.inventoryAlmacenService.getInventoryByAlmacen(this.selectedAlmacen!.id).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.hasRecords = true;
          this.dataSource = new MatTableDataSource<InventoryAlmacenModel>(data);
          this.dataSource.paginator = this.paginator;
          this.dataLoaded = true;
        } else
          this.hasRecords = false;
      },
      error: (e) => {
      }
    });
  }

  getUserName(name: string, lastname: string): string {
    if (name && lastname)
      return name[0].toUpperCase() + lastname[0].toUpperCase();
    else return '';
  }


  onNew() {
    this.router.navigate(['inventario-almacen/entrada/', this.selectedAlmacen!.id]);
  }

  onView(id: string) {
    this.router.navigate(['inventario-almacen/entrada/', this.selectedAlmacen!.id, id]);
  }

  onViewHistory(id: string) {
    this.router.navigate(['inventario-almacen/historial-almacen/', id]);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  getPathPhoto(photo: string): string {
    return `${environment.apiUrl}images/articulos/${photo}`
  }
}
