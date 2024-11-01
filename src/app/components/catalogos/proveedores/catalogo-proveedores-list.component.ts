import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource} from '@angular/material/table';
import { CatalogoProveedoresService } from 'src/app/services/catalogo-proveedor.service';
import { CatalogoProveedorModel } from 'src/app/models/catalogo-proveedor.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-catalogo-proveedores-list',
  templateUrl: './catalogo-proveedores-list.component.html',
  styleUrls: ['./catalogo-proveedores-list.component.css']
})
export class CatalogoProveedoresListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['proveedor', 'telefono', 'correo', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoProveedorModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private catalogoProveedoresService: CatalogoProveedoresService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.catalogoProveedoresService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0){
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoProveedorModel>(data);
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
    this.router.navigate(['compras/catalogos/proveedores/detail']);
  }

  onView(id: string){
    this.router.navigate(['compras/catalogos/proveedores/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['compras/catalogos/proveedores/detail', id], {
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
