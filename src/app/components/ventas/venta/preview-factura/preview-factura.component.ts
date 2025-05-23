import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { float } from '@zxing/library/esm/customTypings';
import { FacturaModel, ReceptorModel } from 'src/app/models/factura.model';
import { VentaModel, VentaArticuloModel } from 'src/app/models/ventas.model';
import { VentaService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-factura',
  templateUrl: './preview-factura.component.html',
  styleUrls: ['./preview-factura.component.css']
})

export class PreviewFacturaComponent implements OnInit, OnDestroy {

  @Output() cancel = new EventEmitter();
  @Output() timbrar = new EventEmitter();
  @Input() venta: VentaModel | undefined;
  factura: FacturaModel | undefined;

  displayedColumns: string[] = ['unidad', 'producto_servicio', 'cantidad', 'descripcion', 'p_unitario', 'importe'];
  dataSourceArticulos = new MatTableDataSource<VentaArticuloModel>([]);

  ocultarIva = true;
  ocultarRetiene = true;

  porcentajeIva = 0;
  porcentajeRetiene = 0;

  subTotal: number = 0;
  iva: number = 0;
  retencion: number = 0;
  total: number = 0;

  constructor(private dialog: MatDialog, private ventaService: VentaService) {
  }

  ngOnInit() {
    try {
      this.factura = new FacturaModel();
      this.factura.receptor = new ReceptorModel();
      this.factura.receptor.nombre = this.venta?.cliente?.nombre_fiscal;
      this.factura.receptor.rfc = this.venta?.cliente?.rfc;
      this.factura.receptor.domicilio_fiscal = `${this.venta?.cliente?.calle} Col. ${this.venta?.cliente?.colonia}, C.P. ${this.venta?.cliente?.cp}, ${this.venta?.cliente?.city?.name}, ${this.venta?.cliente?.state?.name}, ${this.venta?.cliente?.country?.name}`;
      this.factura.receptor.regimen_fiscal = this.venta?.cliente?.regimen_fiscal?.name;


      this.dataSourceArticulos.data = this.venta?.articulos || [];

      this.factura.formaPago = this.venta?.forma_pago?.name;
      this.factura.metodoPago = this.venta?.metodo_pago?.name;
      this.factura.moneda = this.venta?.moneda
      this.factura.uso_cfdi = this.venta?.uso_cfdi?.name;
      this.factura.tipo_cambio = this.venta?.tipo_cambio;

      // Totales
      this.factura.porcentajeIva = this.venta?.translada_iva_porcentaje ?? 0;
      this.porcentajeIva = this.factura.porcentajeIva * 100;
      if (this.factura.porcentajeIva == 0)
        this.ocultarIva = false;

      this.factura.porcentajeRetiene = this.venta?.retiene_iva_porcentaje ?? 0;
      this.porcentajeRetiene = this.factura.porcentajeRetiene * 100;
      if (this.factura.porcentajeRetiene == 0)
        this.ocultarRetiene = false;

      this.calcularSubTotal();
      this.calcularIva();
      this.calcularRetencion();
      this.calcularTotal();


      /*this.ventaService.getVentaById(this.ventaId).subscribe({
        next: (data) => {
          this.factura = new FacturaModel();
          this.factura.receptor = new ReceptorModel();
          this.factura.receptor.nombre = data.cliente?.nombre_fiscal;
          this.factura.receptor.rfc = data.cliente?.rfc;
          this.factura.receptor.domicilio_fiscal = data.cliente?.full_direction;
          this.factura.receptor.regimen_fiscal = data.cliente?.regimen_fiscal?.name;
          this.dataSourceArticulos.data = data.articulos?.map((a) => {
            return {
              unidad: a.unidad_medida?.name,
              producto_servicio: a.producto_servicio_model,
              cantidad: a.cantidad,
              descripcion: a.articulo_descripcion,
              p_unitario: `$${(a.precio_venta ?? 0).toFixed(2)}`,
              p_unitario_number: a.precio_venta,
              importe: `$${((a.cantidad ?? 0) * (a.precio_venta ?? 0)).toFixed(2)}`,
            }
          }) || [];
          this.factura.subTotal = `$${this.calcularSubTotal().toFixed(2)}`,
          this.factura.subTotalIva = `$${this.calcularIva().toFixed(2)}`;
          this.factura.total = `$${this.calcularTotal().toFixed(2)}`;
          this.factura.formaPago = data.forma_pago?.name;
          this.factura.metodoPago = data.metodo_pago?.name;
          this.factura.moneda = data.moneda
          
        },
        error: (e) => {
          console.error("Error al obtener la venta en el preview de la factura...")
        }
      });
      */
    } catch (error) {
      console.error('An error occurred in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
  }

  onAdd() {
    try {
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  onCancel() {
    try {
      this.cancel.emit();
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  onTimbrar() {
    try {
      this.timbrar.emit();
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  calcularSubTotal() {
    this.subTotal = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      let totalConDescuento = this.obtenerTotalConDescuento(articulo);
      this.subTotal += (totalConDescuento) * (articulo.cantidad ?? 0);
    });
  }

  calcularIva() {
    if (this.factura?.porcentajeIva == 0 || !this.factura?.porcentajeIva == undefined)
      this.iva = 0;

    this.iva = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.iva += ((this.obtenerTotalConDescuento(articulo) ?? 0) * (articulo.cantidad ?? 0)) * (this.factura?.porcentajeIva || 0);
    });
  }

  calcularRetencion() {
    if (this.factura?.porcentajeRetiene == 0 || !this.factura?.porcentajeRetiene == undefined)
      this.retencion = 0;

    this.retencion = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      this.retencion += ((this.obtenerTotalConDescuento(articulo) ?? 0) * (articulo.cantidad ?? 0)) * (this.factura?.porcentajeRetiene || 0);
    });
  }

  calcularTotal() {
    this.total = this.subTotal + this.iva - this.retencion;
  }

  obtenerTotalConDescuento(articulo: VentaArticuloModel): number {
    let totalConDescuento = 0;
    if (this.factura?.moneda == "MXN") {
      if (articulo.moneda_nombre == "MXN")
        totalConDescuento = articulo.totalConDescuento ?? 0;
      else if (articulo.moneda_nombre == "USD")
        totalConDescuento = (articulo.totalConDescuento ?? 0) * (this.factura.tipo_cambio || 0);
    }
    else if (this.factura?.moneda == "USD") {
      if (articulo.moneda_nombre == "MXN")
        totalConDescuento = (articulo.totalConDescuento ?? 0) / (this.factura.tipo_cambio || 0);
      else if (articulo.moneda_nombre == "USD")
        totalConDescuento = (articulo.totalConDescuento ?? 0);
    }
    return totalConDescuento;
  }

  getFormattedDate(): string {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const year = currentDate.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;

    return `${formattedDay}/${formattedMonth}/${year}`;
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

  getEnvEmisorNombre(): string {
    return environment.emisorFactura.emisor;
  }

  getEnvEmisorRfc(): string {
    return environment.emisorFactura.rfc;
  }

  getEnvEmisorDomicilioFiscal(): string {
    return environment.emisorFactura.domicilioFiscal;
  }

  getEnvEmisorLugarDeExpedicion(): string {
    return environment.emisorFactura.lugarDeExpidicion;
  }

  getEnvEmisorRegimenFiscal(): string {
    return environment.emisorFactura.regimenFiscal;
  }
}