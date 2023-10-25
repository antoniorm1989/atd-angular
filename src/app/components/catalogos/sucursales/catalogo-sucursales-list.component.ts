import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoSucursalesService } from 'src/app/services/catalogo-sucursales.service';
import { CatalogoSucursalModel } from 'src/app/models/catalogo-sucursal.model';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-catalogo-sucursales-list',
  templateUrl: './catalogo-sucursales-list.component.html',
  styleUrls: ['./catalogo-sucursales-list.component.css']
})
export class CatalogoSucursalesListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['name', 'phone', 'location', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoSucursalModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private catalogoSucursalesService: CatalogoSucursalesService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.catalogoSucursalesService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0){
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoSucursalModel>(data);
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
    this.router.navigate(['catalogos/sucursales/detail']);
  }

  onView(id: string){
    this.router.navigate(['catalogos/sucursales/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['catalogos/sucursales/detail', id], {
      queryParams: { action: 'edit' },
    });
  }
}
