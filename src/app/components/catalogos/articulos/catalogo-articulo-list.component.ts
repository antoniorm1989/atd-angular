import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoadingService } from 'src/app/components/genericos/loading/loading.service';

@Component({
  selector: 'app-articulos-list',
  templateUrl: './catalogo-articulo-list.component.html',
  styleUrls: ['./catalogo-articulo-list.component.css']
})

export class CatalogoArticuloListComponent implements OnInit {

  hasRecords = false;
  displayedColumns: string[] = ['part_number', 'description', 'cat_articulo_id', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoArticuloModel>([]);
  
  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  sortField = 'name';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';
  @ViewChild(MatSort) sort!: MatSort;

  searchText: string = '';
  searchControl = new FormControl('');

  constructor(private catalogoArticuloService: CatalogoArticuloService, private router: Router, private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(700), // espera 2 segundos después de dejar de escribir
        distinctUntilChanged()
      )
      .subscribe((value: string | null) => {
        this.searchText = (value ?? '').trim();
        this.pageIndex = 0; // reinicia a la primera página
        this.loadArticulos(1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
      });

    this.loadArticulos(this.pageIndex + 1, this.pageSize);
  }

  
  loadArticulos(page: number, limit: number, sort: string = 'name', order: string = 'asc' , search: string = '') {
    this.loadingService.show();
    this.catalogoArticuloService.getAll(page, limit, sort, order, search).subscribe({
      next: (res) => {
        this.hasRecords = res.data.length > 0;
        this.dataSource.data = res.data;
        this.totalItems = res.total;
        this.loadingService.hide();
      },
      error: (e) => {
        console.error('Error cargando artículos', e);
        this.loadingService.hide();
      }
    });
  }
  
  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadArticulos(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadArticulos(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  formatDate(stringDate: string): string {
    const date = new Date(stringDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}/${day}/${year}`;
  }

  getUserName(name: string, last_name: string): string {
    return name[0].toUpperCase() + last_name[0].toUpperCase();
  }

  onNew() {
    this.router.navigate(['almacenes/catalogos/articulos/detail']);
  }

  onView(id: string) {
    this.router.navigate(['almacenes/catalogos/articulos/detail', id]);
  }

  onViewCategory(categoryId: string) {
    this.router.navigate(['almacenes/catalogos/categoria-articulos/detail', categoryId]);
  }

  onEdit(id: string) {
    this.router.navigate(['almacenes/catalogos/articulos/detail', id], {
      queryParams: { action: 'edit' },
    });
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
    this.loadArticulos(1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  onClearSearchText() {
    this.searchControl.setValue('');
    this.hasRecords = true;
  }
}
