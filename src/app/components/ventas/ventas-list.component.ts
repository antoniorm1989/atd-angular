import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { VentaModel } from 'src/app/models/ventas.model';
import { VentaService } from 'src/app/services/ventas.service';
import { CatalogoClienteModel } from 'src/app/models/catalogo-cliente.model';
import { Observable, map, startWith } from 'rxjs';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogSuccessComponent } from '../genericos/dialogSuccess.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';


@Component({
  selector: 'app-ventas-list',
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.css']
})

export class VentasListComponent implements OnInit {

  hasRecords = false;
  displayedColumns: string[] = ['id', 'estatus', 'estatusFactura', 'factura_folio', 'estatus_pago', 'creacion', 'cliente', 'importe', 'responsable', 'actions'];
  dataSource = new MatTableDataSource<VentaModel>([]);
  private dataLoaded = false;

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  sortField = 'name';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';
  @ViewChild(MatSort) sort!: MatSort;

  form: FormGroup;

  clientes: CatalogoClienteModel[] = [];
  selectedCliente: CatalogoClienteModel | undefined;
  filteredClientes!: Observable<CatalogoClienteModel[]>;

  facturaEstatusLabels: { [key: number]: string } = {
    1: 'Fallida',
    2: 'Cancelada',
    3: 'Pre-Cancelada',
    4: 'Timbrada',
  };

  ventaEstatusLabels: { [key: number]: string } = {
    1: 'BackOrder',
    3: 'Cancelada',
    2: 'Despachada',
    4: 'Pendiente',
  };

  ventaPagoEstatusLabels: { [key: number]: string } = {
    1: 'Pendiente',
    2: 'Parcial',
    3: 'Pagado',
    4: 'Reembolsado'
  };

  constructor(
    private formBuilder: FormBuilder,
    private ventaService: VentaService,
    private router: Router,
    private catalogoClientesService: CatalogoClientesService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) {

    this.form = this.formBuilder.group({
      cliente: null,
      factura_estatus: null,
      venta_estatus: null,
      fechaDesde: null,
      fechaHasta: null,
      backOrder: false
    });

  }

  get f() { return this.form!.controls; }

  ngOnInit(): void {
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    this.loadSelectData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadVentas(page: number, limit: number, sort: string = 'name', order: string = 'asc') {
    let clienteId = this.selectedCliente?.id;
    let fechaDesde = this.f['fechaDesde'].value;
    let fechaHasta = this.f['fechaHasta'].value;
    let backOrder = this.f['backOrder'].value;
    let facturaEstatus = this.f['factura_estatus'].value;
    let ventaEstatus = this.f['venta_estatus'].value;
    let hasFilters = clienteId != undefined || fechaDesde != undefined || fechaHasta != undefined || backOrder != false || facturaEstatus != undefined || ventaEstatus != undefined;

    this.ventaService.getAll(clienteId, facturaEstatus, ventaEstatus, fechaDesde, fechaHasta, backOrder, page, limit, sort, order).subscribe({
      next: (res) => {
        if (res.data.length > 0) {
          this.hasRecords = res.data.length > 0;
          this.dataSource.data = res.data;
          this.totalItems = res.total;
        } else {
          if (!hasFilters)
            this.hasRecords = false;

          this.dataSource = new MatTableDataSource<VentaModel>([]);
        }
      },
      error: (e) => {
      }
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
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
      maximumFractionDigits: 4
    }).format(valor);
  }

  loadSelectData() {
    this.catalogoClientesService.getAll().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.clientes = data;
          this.filteredClientes = this.form.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
          );
        }
      },
      error: (e) => {
      }
    });
  }

  clearAutocompleteInput() {
    try {
      this.f['cliente'].reset();
      this.selectedCliente = undefined;
      this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  clearSelectionFacturaEstatus() {
    try {
      this.f['factura_estatus'].reset();
      this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  clearSelectionVentaEstatus() {
    try {
      this.f['venta_estatus'].reset();
      this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  onSelectChangeFacturaEstatus(event: any) {
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onSelectChangeVentaEstatus(event: any) {
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onClienteSelectionChange(event: any) {
    if (event.source._selected == true) {
      this.selectedCliente = event.source.value;
      this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    }
  }

  onDateChange(event: any) {
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onToggleChange(event: any) {
    this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  private _filter(value: any): CatalogoClienteModel[] {
    let filterValue = "";
    if (value.cliente) {
      filterValue = value.cliente.nombre_fiscal || value.cliente;
      filterValue = filterValue.toLowerCase();
    }
    return this.clientes.filter(option => option.nombre_fiscal!.toLowerCase().includes(filterValue));
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

  descargarFacturaPDF(factura_cfdi_uid: string, ventaId: number) {
    if (factura_cfdi_uid == undefined || factura_cfdi_uid == "") {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.ventaService.descargarFactura(factura_cfdi_uid, 'pdf').subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          // Descarga el archivo en lugar de abrirlo
          const link = document.createElement('a');
          link.href = url;
          link.download = `cfdi_${ventaId}.pdf`;
          link.click();

          window.URL.revokeObjectURL(url);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  descargarFacturaXML(factura_cfdi_uid: string, ventaId: number) {
    if (factura_cfdi_uid == undefined || factura_cfdi_uid == "") {
      this.openSnackBarError('No se ha generado la factura aún.');
    } else {
      this.ventaService.descargarFactura(factura_cfdi_uid, 'xml').subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);

          // Descarga el archivo en lugar de abrirlo
          const link = document.createElement('a');
          link.href = url;
          link.download = `cfdi_${ventaId}.xml`;
          link.click();

          window.URL.revokeObjectURL(url);
        },
        error: (e) => {
          console.log(e);
        }
      });
    }
  }

  openDialogSuccess(comment: string): void {
    const dialogRef = this.dialog.open(DialogSuccessComponent, {
      width: '710px',
      data: { title: '¡ En hora buena !', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      this.loadVentas(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    });
  }

  openSnackBarError(message: string) {
    this._snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
      duration: 5000,
    });
  }

  formatNumber(input: number): string {
    return input.toString().padStart(4, '0');
  }

}