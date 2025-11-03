import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { map, Observable, startWith } from "rxjs";
import { CatalogoProveedorModel } from "src/app/models/catalogo-proveedor.model";
import { OrdenCompraModel } from "src/app/models/orden-compra.model";
import { CatalogoProveedoresService } from "src/app/services/catalogo-proveedor.service";
import { OrdenCompraService } from "src/app/services/orden-compra.service";
import { environment } from "src/environments/environment.staging";
import { DialogSuccessComponent } from "../genericos/dialogSuccess.component";

@Component({
  selector: 'app-orden-compra-list',
  templateUrl: './orden-compra-list.component.html',
  styleUrls: ['./orden-compra-list.component.css']
})
export class OrdenCompraListComponent {
  hasRecords = false;
  displayedColumns: string[] = ['estatus', 'id', 'venta_id', 'articulos', 'proveedor', 'importe', 'created_at', 'responsable', 'actions'];
  dataSource = new MatTableDataSource<OrdenCompraModel>([]);

  totalItems = 0;
  pageSize = 20;
  pageIndex = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  sortField = 'oc.id';
  sortDirection: 'asc' | 'desc' | 'none' = 'none';
  @ViewChild(MatSort) sort!: MatSort;

  form: FormGroup;

  proveedores: CatalogoProveedorModel[] = [];
  selectedProveedor: CatalogoProveedorModel | undefined;
  filteredProveedores!: Observable<CatalogoProveedorModel[]>;

  estatusLabels: { [key: string]: string } = {
    'EN_PROCESO': 'En Proceso',
    'PARCIALMENTE_SURTIDA': 'Parcialmente',
    'COMPLETA': 'Surtida',
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ordenCompraService: OrdenCompraService,
    private catalogoProveedoresService: CatalogoProveedoresService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) {

    this.form = this.formBuilder.group({
      proveedor: null,
      estatus: null,
      fechaDesde: null,
      fechaHasta: null
    });

  }

  get f() { return this.form!.controls; }

  ngOnInit(): void {
    this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    this.loadSelectData();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadOrdenesCompra(page: number, limit: number, sort: string = 'name', order: string = 'asc') {
    let proveedorId = this.selectedProveedor?.id;
    let fechaDesde = this.f['fechaDesde'].value;
    let fechaHasta = this.f['fechaHasta'].value;
    let estatus = this.f['estatus'].value;
    let hasFilters = proveedorId != undefined || fechaDesde != undefined || fechaHasta != undefined || estatus != undefined;

    this.ordenCompraService.getAll(proveedorId, estatus, fechaDesde, fechaHasta, page, limit, sort, order).subscribe({
      next: (res) => {
        if (res.data.length > 0) {
          this.hasRecords = res.data.length > 0;
          this.dataSource.data = res.data;
          this.totalItems = res.total;
        } else {
          if (!hasFilters)
            this.hasRecords = false;

          this.dataSource = new MatTableDataSource<OrdenCompraModel>([]);
        }
      },
      error: (e) => {
      }
    });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onSortChange(event: Sort) {
    this.sortField = event.active;
    this.sortDirection = event.direction || 'none';
    this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
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
    this.router.navigate(['orden-compra/detail']);
  }

  onView(id: string) {
    this.router.navigate(['orden-compra/detail', id]);
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
    this.catalogoProveedoresService.getAll().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.proveedores = data;
          this.filteredProveedores = this.form.valueChanges.pipe(
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
      this.f['proveedor'].reset();
      this.selectedProveedor = undefined;
      this.pageIndex = 0;
      this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  clearSelectionOrdenCompraEstatus() {
    try {
      this.f['estatus'].reset();
      this.pageIndex = 0;
      this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    } catch (error) {
      console.error('An error occurred in clearSelectionOrdenCompraEstatus:', error);
    }
  }

  onSelectChangeFacturaEstatus(event: any) {
    this.pageIndex = 0;
    this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onSelectChangeEstatus(event: any) {
    this.pageIndex = 0;
    this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  onProveedorSelectionChange(event: any) {
    if (event.source._selected == true) {
      this.selectedProveedor = event.source.value;
      this.pageIndex = 0;
      this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
    }
  }

  onDateChange(event: any) {
    this.pageIndex = 0;
    this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
  }

  private _filter(value: any): CatalogoProveedorModel[] {
    let filterValue = "";
    if (value.cliente) {
      filterValue = value.cliente.nombre_fiscal || value.cliente;
      filterValue = filterValue.toLowerCase();
    }
    return this.proveedores.filter(option => (option.nombreContacto!.toLowerCase() + " " + option.apellidoContacto!.toLowerCase()).includes(filterValue));
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

  openDialogSuccess(comment: string): void {
    const dialogRef = this.dialog.open(DialogSuccessComponent, {
      width: '710px',
      data: { title: '¡ En hora buena !', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      this.loadOrdenesCompra(this.pageIndex + 1, this.pageSize, this.sortField, this.sortDirection);
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

  deleteOrdenCompra(id: number) {
    // Add confirmation dialog if needed
    const confirm = window.confirm('¿Estás seguro de que deseas eliminar esta orden de compra?');
    if (!confirm) {
      return;
    }
    
    this.ordenCompraService.delete(id).subscribe({
      next: (res) => {
        this.openDialogSuccess('La orden de compra ha sido eliminada exitosamente.');
      },
      error: (e) => {
        this.openSnackBarError('Ocurrió un error al eliminar la orden de compra.');
      }
    });
  }
 
}