import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoadingService } from 'src/app/components/genericos/loading/loading.service';
import { CatalogoCuentaBancariaModel } from 'src/app/models/catalogos.model';
import { CatalogoCuentaBancariaService } from 'src/app/services/catalogo-cuenta-bancaria.service';


@Component({
  selector: 'app-catalogo-cuenta-bancaria-list',
  templateUrl: './catalogo-cuenta-bancaria-list.component.html',
  styleUrls: ['./catalogo-cuenta-bancaria-list.component.css'],
})

export class CatalogoCuentaBancariaListComponent implements OnInit {

  hasRecords = false;
  displayedColumns: string[] = ['numero_cuenta', 'descripcion', 'moneda', 'banco', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoCuentaBancariaModel>([]);
  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  sortField = 'created';
  sortDirection: 'asc' | 'desc' | 'none' = 'desc';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchText: string = '';
  searchControl = new FormControl('');

  constructor(private catalogoCuentaBancariaService: CatalogoCuentaBancariaService, private router: Router, private loadingService: LoadingService) {
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(700), // espera 2 segundos después de dejar de escribir
        distinctUntilChanged()
      )
      .subscribe((value: string | null) => {
        this.searchText = (value ?? '').trim();
        this.pageIndex = 0; // reinicia a la primera página
        this.loadCuentaBancarias(1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
      });

    this.loadCuentaBancarias(this.pageIndex + 1, this.pageSize);
  }

  loadCuentaBancarias(page: number, limit: number, sort: string = 'created', order: string = 'desc', search: string = '') {
    this.loadingService.show();
    this.catalogoCuentaBancariaService.getAllPaginated(page, limit, sort, order, search).subscribe({
      next: (res) => {
        this.hasRecords = res.data.length > 0;
        this.dataSource.data = res.data;
        this.totalItems = res.total;
        this.loadingService.hide();
      },
      error: (e) => {
        console.error('Error cargando categorías', e);
        this.loadingService.hide();
      }
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCuentaBancarias(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadCuentaBancarias(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
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
    this.router.navigate(['venta/catalogos/cuenta-bancaria/detail']);
  }

  onView(id: string) {
    this.router.navigate(['venta/catalogos/cuenta-bancaria/detail', id]);
  }

  onEdit(id: string) {
    this.router.navigate(['venta/catalogos/cuenta-bancaria/detail', id], {
      queryParams: { action: 'edit' },
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

  onSearchNow() {
    this.searchText = (this.searchControl.value ?? '').trim();
    this.pageIndex = 0;
    this.loadCuentaBancarias(1, this.pageSize, this.sortField, this.sortDirection, this.searchText);
  }

  onClearSearchText() {
    this.searchControl.setValue('');
    this.hasRecords = true;
  }

}
