import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { VentaModel } from 'src/app/models/ventas.model';
import { VentaService } from 'src/app/services/ventas.service';
import { CatalogoClienteModel } from 'src/app/models/catalogo-cliente.model';
import { Observable, fromEvent, map, startWith } from 'rxjs';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-ventas-list',
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.css']
})

export class VentasListComponent {

  hasRecords = false;
  displayedColumns: string[] = ['id', 'estatus', 'backorder', 'creacion', 'cliente', 'moneda', 'importe', 'fecha_sat', 'responsable'];
  dataSource = new MatTableDataSource<VentaModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private dataLoaded = false;

  form: FormGroup;

  clientes: CatalogoClienteModel[] = [];
  selectedCliente: CatalogoClienteModel | undefined;
  filteredClientes!: Observable<CatalogoClienteModel[]>;

  constructor(private formBuilder: FormBuilder, private ventaService: VentaService, private router: Router, private catalogoClientesService: CatalogoClientesService
  ) {


    this.form = this.formBuilder.group({
      cliente: null,
      estatus: null,
      fechaDesde: null,
      fechaHasta: null,
      backOrder: false
    });

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd && event.url == '/ventas' && !this.dataLoaded) {
        this.onLoadVentas();
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
      this.onLoadVentas();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  clearSelectionEstatus() {
    try {
      this.f['estatus'].reset();
      this.onLoadVentas();
    } catch (error) {
      console.error('An error occurred in clearAutocompleteInput:', error);
    }
  }

  onSelectChangeEstatus(event: any) {
    this.onLoadVentas();
  }

  onClienteSelectionChange(event: any) {
    if (event.source._selected == true) {
      this.selectedCliente = event.source.value;
      this.onLoadVentas();
    }
  }

  onDateChange(event: any) {
    this.onLoadVentas();
  }

  onToggleChange(event: any) {
    this.onLoadVentas();
  }

  onLoadVentas() {
    let clienteId = this.selectedCliente?.id;
    let estatus = this.f['estatus'].value;
    let fechaDesde = this.f['fechaDesde'].value;
    let fechaHasta = this.f['fechaHasta'].value;
    let backOrder = this.f['backOrder'].value;
    let hasFilters = clienteId != undefined || estatus != undefined || fechaDesde != undefined || fechaHasta != undefined || backOrder != false;

    this.ventaService.getAll(clienteId, estatus, fechaDesde, fechaHasta, backOrder).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.hasRecords = true;
          this.dataSource = new MatTableDataSource<VentaModel>(data);
          this.dataSource.paginator = this.paginator;
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


  private _filter(value: any): CatalogoClienteModel[] {
    let filterValue = "";
    if (value.cliente) {
      filterValue = value.cliente.nombre_fiscal || value.cliente;
      filterValue = filterValue.toLowerCase();
    }
    return this.clientes.filter(option => option.nombre_fiscal!.toLowerCase().includes(filterValue));
  }

  capitalizeWords(str: string): string {
    return str
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

}
