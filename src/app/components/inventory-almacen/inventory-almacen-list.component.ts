import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { InventoryAlmacenModel } from 'src/app/models/inventory-almacen.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoadingService } from 'src/app/components/genericos/loading/loading.service';

@Component({
  selector: 'app-inventory-almacen-list',
  templateUrl: './inventory-almacen-list.component.html',
  styleUrls: ['./inventory-almacen-list.component.css']
})

export class InventoryAlmacenListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['part_number', 'description', 'category', 'stock', 'incoming', 'minimum_stock', 'maximum_stock', 'user', 'actions'];
  dataSource = new MatTableDataSource<InventoryAlmacenModel>([]);
  dataLoaded = false;

  almacenId: number | undefined;
  selectedAlmacen: CatalogoAlmacenModel | null = null;
  almacenes: CatalogoAlmacenModel[] = [];

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchText: string = '';
  searchControl = new FormControl('');

  constructor(private inventoryAlmacenService: InventoryAlmacenService, private catalogoAlmacenesService: CatalogoAlmacenesService, private router: Router, private loadingService: LoadingService) {
  }

  ngOnInit(): void {
    this.catalogoAlmacenesService.getAll().subscribe({
      next: (data) => {
        this.almacenes = data;
        if (data.length > 0) {
          this.selectedAlmacen = data[0];
          this.almacenId = this.selectedAlmacen.id;
          this.loadInventario(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
        }
      },
      error: (e) => {
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(700), // espera 2 segundos después de dejar de escribir
        distinctUntilChanged()
      )
      .subscribe((value: string | null) => {
        this.searchText = (value ?? '').trim();
        this.pageIndex = 0; // reinicia a la primera página
        this.loadInventario(1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
      });
  }

  onAlmacenChange(event: any) {
    this.almacenId = event.value.id;
    this.loadInventario(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  loadInventario(page: number, limit: number, sort: string = 'name', order: string = 'asc', search: string = '') {
    this.loadingService.show();
    this.inventoryAlmacenService.getInventoryByAlmacenPaginado(this.almacenId, page, limit, sort, order, search).subscribe({
      next: (res) => {
        this.hasRecords = res.data.length > 0;
        this.dataSource = new MatTableDataSource<InventoryAlmacenModel>(res.data);
        this.totalItems = res.total;
        this.loadingService.hide();
      },
      error: (e) => {
        this.loadingService.hide();
        console.error('Error cargando inventario', e);
      }
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadInventario(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadInventario(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  getUserName(name: string, last_name: string): string {
    if (name && last_name)
      return name[0].toUpperCase() + last_name[0].toUpperCase();
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
    return `${environment.apiUrl}/images/articulos/${photo}`
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

  onSearchNow() {
    this.searchText = (this.searchControl.value ?? '').trim();
    this.pageIndex = 0;
    this.loadInventario(1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  onClearSearchText() {
    this.searchControl.setValue('');
    this.hasRecords = true;
  }
}
