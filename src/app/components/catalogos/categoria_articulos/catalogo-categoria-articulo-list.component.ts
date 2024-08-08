import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoCategoriaArticuloService } from 'src/app/services/catalogo-categoria-articulos.service';
import { CatalogoCategoriaArticuloModel } from 'src/app/models/catalogo-categoria-articulo.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-catalogo-articulos-list',
  templateUrl: './catalogo-categoria-articulo-list.component.html',
  styleUrls: ['./catalogo-categoria-articulo-list.component.css']
})

export class CatalogoCategoriaArticuloListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['name', 'description', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoCategoriaArticuloModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private dataLoaded = false;

  constructor(private catalogoCategoriaArticuloService: CatalogoCategoriaArticuloService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/catalogos/categoria-articulos' && !this.dataLoaded) {
        this.catalogoCategoriaArticuloService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0){
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoCategoriaArticuloModel>(data);
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

  onNew(){
    this.router.navigate(['catalogos/categoria-articulos/detail']);
  }

  onView(id: string){
    this.router.navigate(['catalogos/categoria-articulos/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['catalogos/categoria-articulos/detail', id], {
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
