import { Component, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { CatalogoProveedorModel } from 'src/app/models/catalogo-proveedor.model';
import { Observable, fromEvent, map, startWith } from 'rxjs';
import { CatalogoProveedoresService } from 'src/app/services/catalogo-proveedor.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrdenCompraModel } from 'src/app/models/orden-compa.model';
import { OrdenCompraService } from 'src/app/services/orden-compra.service';

@Component({
  selector: 'app-orden-compra-list',
  templateUrl: './orden-compra-list.component.html',
  styleUrls: ['./orden-compra-list.component.css']
})

export class OrdenesCompraListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['id', 'estatus', 'compra', 'articulos', 'proveedor', 'importe', 'fecha_creacion', 'responsable'];
  dataSource = new MatTableDataSource<OrdenCompraModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private dataLoaded = false;

  form: FormGroup;

  proveedores: CatalogoProveedorModel[] = [];
  selectedProveedor: CatalogoProveedorModel | undefined;
  filteredProveedores!: Observable<CatalogoProveedorModel[]>;

  constructor(private formBuilder: FormBuilder, private ordenCompraService: OrdenCompraService, private router: Router, private catalogoProveedoresService: CatalogoProveedoresService
  ) {
    this.form = this.formBuilder.group({
      proveedor: null,
      estatus: null,
      fechaDesde: null,
      fechaHasta: null
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/compras' && !this.dataLoaded) {
        this.onLoadOrdenesCompra();
        this.loadSelectData();
      }
    });
  }

  get f() { return this.form!.controls; }

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
    this.router.navigate(['compras/detail']);
  }

  onView(id: string) {
    this.router.navigate(['compras/detail', id]);
  }

  onEdit(id: string) {
    this.router.navigate(['compras/detail', id], {
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
      this.onLoadOrdenesCompra();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  clearSelectionEstatus() {
    try {
      this.f['estatus'].reset();
      this.onLoadOrdenesCompra();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  onSelectChangeEstatus(event: any) {
    this.onLoadOrdenesCompra();
  }

  onProveedorSelectionChange(event: any) {
    if (event.source._selected == true) {
      this.selectedProveedor = event.source.value;
      this.onLoadOrdenesCompra();
    }
  }

  onDateChange(event: any) {
    this.onLoadOrdenesCompra();
  }

  onToggleChange(event: any) {
    this.onLoadOrdenesCompra();
  }

  onLoadOrdenesCompra() {
    let proveedorId = this.selectedProveedor?.id;
    let estatus = this.f['estatus'].value;
    let fechaDesde = this.f['fechaDesde'].value;
    let fechaHasta = this.f['fechaHasta'].value;
    let hasFilters = proveedorId != undefined || estatus != undefined || fechaDesde != undefined || fechaHasta != undefined;

    this.ordenCompraService.getAll(proveedorId, estatus, fechaDesde, fechaHasta).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.hasRecords = true;
          this.dataSource = new MatTableDataSource<OrdenCompraModel>(data);
          this.dataSource.paginator = this.paginator;
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


  private _filter(value: any): CatalogoProveedorModel[] {
    let filterValue = "";
    if (value.proveedor) {
      filterValue = value.proveedor.nombre_fiscal || value.proveedor;
      filterValue = filterValue.toLowerCase();
    }
    return this.proveedores.filter(option => (option.nombreContacto!.toLowerCase()).concat(option.apellidoContacto!.toLowerCase()).includes(filterValue));
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

}
