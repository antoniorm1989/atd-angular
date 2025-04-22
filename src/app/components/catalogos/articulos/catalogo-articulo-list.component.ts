import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

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
  pageSize = 10;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private catalogoArticuloService: CatalogoArticuloService, private router: Router) {}

  ngOnInit(): void {
    this.loadArticulos(this.pageIndex + 1, this.pageSize);
  }

  loadArticulos(page: number, limit: number) {
    this.catalogoArticuloService.getAll(page, limit).subscribe({
      next: (res) => {
        this.hasRecords = res.data.length > 0;
        this.dataSource = new MatTableDataSource<CatalogoArticuloModel>(res.data);
        this.totalItems = res.total;
      },
      error: (e) => {
        console.error('Error cargando artículos', e);
      }
    });
  }
  
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadArticulos(this.pageIndex + 1, this.pageSize);
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
}
