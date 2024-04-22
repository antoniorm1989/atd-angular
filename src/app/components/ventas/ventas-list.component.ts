import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { VentaModel } from 'src/app/models/ventas.model';
import { VentaService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-ventas-list',
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.css']
})

export class VentasListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['id', 'creacion', 'cliente', 'moneda', 'importe', 'estatus', 'fecha_sat', 'responsable'];
  dataSource = new MatTableDataSource<VentaModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private dataLoaded = false;

  constructor(private ventaService: VentaService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/ventas' && !this.dataLoaded) {
        this.ventaService.getAll().subscribe({
          next: (data) => {
            if (data.length > 0) {
              this.hasRecords = true;
              this.dataSource = new MatTableDataSource<VentaModel>(data);
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
    this.router.navigate(['ventas/detail']);
  }

  onView(id: string) {
    this.router.navigate(['ventas/detail', id]);
  }

  onEdit(id: string) {
    this.router.navigate(['ventas/detail', id], {
      queryParams: { action: 'edit' },
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  formatearComoMoneda(valor: number | undefined): string {
    if (!valor && valor != 0)
      return 'n/a';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }
}
