import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogoCategoriaArticuloService } from 'src/app/services/catalogo-categoria-articulos.service';
import { CatalogoCategoriaArticuloModel } from 'src/app/models/catalogo-categoria-articulo.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';


@Component({
  selector: 'app-catalogo-categoria-articulos-list',
  templateUrl: './catalogo-categoria-articulo-list.component.html',
  styleUrls: ['./catalogo-categoria-articulo-list.component.css'],
})

export class CatalogoCategoriaArticuloListComponent implements OnInit {

  hasRecords = false;
  displayedColumns: string[] = ['name', 'description', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoCategoriaArticuloModel>([]);
  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  sortField = 'name';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private catalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadCategorias(this.pageIndex + 1, this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadCategorias(page: number, limit: number, sort: string = 'name', order: string = 'asc') {
    this.catalogoCategoriaArticuloService.getAll(page, limit, sort, order).subscribe({
      next: (res) => {
        this.hasRecords = res.data.length > 0;
        this.dataSource.data = res.data;
        this.totalItems = res.total;
      },
      error: (e) => {
        console.error('Error cargando categorías', e);
      }
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCategorias(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadCategorias(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  formatDate(stringDate: string): string {
    const date = new Date(stringDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${month}/${day}/${year}`;
  }

  getUserName(name: string, last_name: string): string {
    return name[0].toUpperCase() + (last_name ? last_name[0].toUpperCase() : '');
  }

  onNew() {
    this.router.navigate(['almacenes/catalogos/categoria-articulos/detail']);
  }

  onView(id: string) {
    this.router.navigate(['almacenes/catalogos/categoria-articulos/detail', id]);
  }

  onEdit(id: string) {
    this.router.navigate(['almacenes/catalogos/categoria-articulos/detail', id], {
      queryParams: { action: 'edit' },
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }
}
