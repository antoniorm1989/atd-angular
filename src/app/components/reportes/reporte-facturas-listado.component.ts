import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { saveAs } from 'file-saver';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { CatalogoAlmacenesService } from 'src/app/services/catalogo-almacenes.service';
import { CatalogoClientesService } from 'src/app/services/catalogo-cliente.service';
import { ReportesService } from 'src/app/services/reportes-service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reporte-facturas-listado',
  templateUrl: './reporte-facturas-listado.component.html',
  styleUrls: ['./reporte-facturas-listado.component.css'],
})
export class ReporteFacturasListadoComponent implements OnInit, OnDestroy {
  form: FormGroup;
  displayedColumns: string[] = [
    'almacen',
    'folio',
    'estatus',
    'cliente',
    'subtotal',
    'iva',
    'total',
    'vendedor',
  ];
  dataSource = new MatTableDataSource<any>([]);
  hasRecords = false;
  isLoading = false;

  almacenes: any[] = [];
  clientes: any[] = [];
  usuarios: any[] = [];
  estatusFactura = [
    { value: 1, label: 'FACTURADA' },
    { value: 2, label: 'CANCELADA' },
  ];

  private formChangesSub?: Subscription;
  private filtrosListos = false;

  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService,
    private catalogoAlmacenesService: CatalogoAlmacenesService,
    private catalogoClienteService: CatalogoClientesService,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      fecha_desde: [null],
      fecha_hasta: [null],
      almacen_id: ['todos'],
      estatus: ['todos'],
      cliente_id: ['todos'],
      usuario_id: ['todos'],
    });
  }

  ngOnInit(): void {
    this.setupAutoRefresh();
    this.cargarFiltros();
  }

  ngOnDestroy(): void {
    this.formChangesSub?.unsubscribe();
  }

  generar(): void {
    if (this.form.invalid || !this.filtrosListos) {
      return;
    }

    const payload = this.obtenerPayload();
    this.isLoading = true;
    this.hasRecords = false;

    this.reportesService.obtenerFacturas(payload).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.hasRecords = data.length > 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  exportarExcel(): void {
    if (!this.hasRecords || !this.filtrosListos) {
      return;
    }
    const payload = this.obtenerPayload();
    this.reportesService.exportarFacturasExcel(payload).subscribe({
      next: (blob) => {
        saveAs(blob, 'reporte_facturas.xlsx');
      },
    });
  }

  private setupAutoRefresh(): void {
    this.formChangesSub = this.form.valueChanges
      .pipe(skip(1), debounceTime(250))
      .subscribe(() => this.generar());
  }

  private obtenerPayload(): Record<string, any> {
    const valores = this.form.value;
    const normalize = (value: any) => (value === 'todos' ? null : value);

    return {
      fecha_desde: valores.fecha_desde,
      fecha_hasta: valores.fecha_hasta,
      almacen_id: normalize(valores.almacen_id),
      estatus: normalize(valores.estatus),
      cliente_id: normalize(valores.cliente_id),
      usuario_id: normalize(valores.usuario_id),
    };
  }

  private cargarFiltros(): void {
    forkJoin({
      almacenes: this.catalogoAlmacenesService.getAll(),
      clientes: this.catalogoClienteService.getAll(),
      usuarios: this.userService.getAll(),
    }).subscribe({
      next: ({ almacenes, clientes, usuarios }) => {
        this.almacenes = almacenes ?? [];
        this.clientes = clientes ?? [];
        this.usuarios = usuarios ?? [];
        this.filtrosListos = true;
        this.generar();
      },
      error: () => {
        this.filtrosListos = true;
      },
    });
  }
}