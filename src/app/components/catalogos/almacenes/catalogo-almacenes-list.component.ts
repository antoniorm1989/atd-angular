import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource} from '@angular/material/table';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';

@Component({
  selector: 'app-catalogo-almacenes-list',
  templateUrl: './catalogo-almacenes-list.component.html',
  styleUrls: ['./catalogo-almacenes-list.component.css']
})
export class CatalogoAlmacenesListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['name', 'phone', 'location', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoAlmacenModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private catalogoAlmacenesService: CatalogoAlmacenesService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.catalogoAlmacenesService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0){
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<CatalogoAlmacenModel>(data);
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

  getUserName(name: string, lastName: string): string {
    return name[0].toUpperCase() + lastName[0].toUpperCase();
  }

  onNew(){
    this.router.navigate(['catalogos/almacenes/detail']);
  }

  onView(id: string){
    this.router.navigate(['catalogos/almacenes/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['catalogos/almacenes/detail', id], {
      queryParams: { action: 'edit' },
    });
  }
}
