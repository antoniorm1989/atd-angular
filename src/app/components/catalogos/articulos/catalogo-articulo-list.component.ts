import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoArticuloService } from 'src/app/services/catalogo-articulos.service';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-articulos-list',
  templateUrl: './catalogo-articulo-list.component.html',
  styleUrls: ['./catalogo-articulo-list.component.css']
})

export class CatalogoArticuloListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['part_number', 'description', 'cat_articulo_id', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private dataLoaded = false;

  constructor(private catalogoArticuloService: CatalogoArticuloService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/catalogos/articulos' && !this.dataLoaded) {
        this.catalogoArticuloService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0) {
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoArticuloModel>(data);
              this.dataSource.paginator = this.paginator;
              this.dataLoaded = true;
            }
          },
          error: (e) => {
          }
        });
      }
    });
  }

  formatDate(stringDate: string): string {
    const date = new Date(stringDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}/${day}/${year}`;
  }

  getUserName(name: string, lastname: string): string {
    return name[0].toUpperCase() + lastname[0].toUpperCase();
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
    this.router.navigate(['catalogos/articulos/detail', id], {
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
