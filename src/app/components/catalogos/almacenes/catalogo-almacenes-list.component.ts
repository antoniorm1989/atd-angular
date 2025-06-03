import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource} from '@angular/material/table';
import { CatalogoAlmacenModel } from 'src/app/models/catalogo-almacen.model';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { environment } from 'src/environments/environment';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-catalogo-almacenes-list',
  templateUrl: './catalogo-almacenes-list.component.html',
  styleUrls: ['./catalogo-almacenes-list.component.css']
})
export class CatalogoAlmacenesListComponent{

  hasRecords = false;
  displayedColumns: string[] = ['name', 'phone', 'location', 'created', 'modified', 'user', 'status', 'actions'];
  dataSource = new MatTableDataSource<CatalogoAlmacenModel>([]);
  
  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  sortField = 'name';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private catalogoAlmacenesService: CatalogoAlmacenesService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadAlmacenes(this.pageIndex + 1, this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadAlmacenes(page: number, limit: number, sort: string = 'name', order: string = 'asc') {
    this.catalogoAlmacenesService.getAllPaginado(page, limit, sort, order).subscribe({
      next: (res) => {
        this.hasRecords = res.data.length > 0;
        this.dataSource.data = res.data;
        this.totalItems = res.total;
      },
      error: (e) => {
        console.error('Error cargando categorías', e);
      }
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadAlmacenes(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadAlmacenes(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
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

  onNew(){
    this.router.navigate(['almacenes/catalogos/almacenes/detail']);
  }

  onView(id: string){
    this.router.navigate(['almacenes/catalogos/almacenes/detail', id]);
  }

  onEdit(id: string){
    this.router.navigate(['almacenes/catalogos/almacenes/detail', id], {
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
