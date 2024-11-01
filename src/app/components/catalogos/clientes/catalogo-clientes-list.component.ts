import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { CatalogoClienteModel } from 'src/app/models/catalogo-cliente.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-catalogo-clientes-list',
  templateUrl: './catalogo-clientes-list.component.html',
  styleUrls: ['./catalogo-clientes-list.component.css']
})
export class CatalogoClientesListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['cliente', 'rfc', 'correo', 'telefono', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoClienteModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private catalogoClientesService: CatalogoClientesService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.catalogoClientesService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0){
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoClienteModel>(data);
              this.dataSource.paginator = this.paginator;
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
    this.router.navigate(['venta/catalogos/clientes/detail']);
  }

  onView(id: string){
    this.router.navigate(['venta/catalogos/clientes/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['venta/catalogos/clientes/detail', id], {
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
