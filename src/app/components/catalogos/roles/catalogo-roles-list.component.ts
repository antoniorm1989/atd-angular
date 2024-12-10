import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { CatalogoRolesService } from 'src/app/services/catalogo-roles.service';
import { CatalogoRolModel } from 'src/app/models/catalogo-rol.model';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-catalogo-roles-list',
  templateUrl: './catalogo-roles-list.component.html',
  styleUrls: ['./catalogo-roles-list.component.css']
})
export class CatalogoRolesListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['name', 'description', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoRolModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private dataLoaded = false;

  constructor(private catalogoRolesService: CatalogoRolesService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/configuracion/catalogos/roles' && !this.dataLoaded) {
        this.catalogoRolesService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0){
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoRolModel>(data);
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
    this.router.navigate(['configuracion/catalogos/roles/detail']);
  }

  onView(id: string){
    this.router.navigate(['configuracion/catalogos/roles/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['configuracion/catalogos/roles/detail', id], {
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
