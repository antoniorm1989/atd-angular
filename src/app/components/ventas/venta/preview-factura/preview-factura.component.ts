import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { float } from '@zxing/library/esm/customTypings';
import { FacturaModel, ReceptorModel } from 'src/app/models/factura.model';
import { VentaModel } from 'src/app/models/ventas.model';
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
  dataSourceArticulos = new MatTableDataSource<any>([]);

  ocultarIva = true;
  ocultarRetiene = true;
  ocultarDescuento = true;

  porcentajeIva = 0;
  porcentajeRetiene = 0;

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

          
          let descuento = 0;
          this.dataSourceArticulos.data = this.venta?.articulos?.map((a) => {
            descuento += a.descuento ?? 0;
            return {
              unidad: a.unidad_medida?.name,
              producto_servicio: a.producto_servicio?.name,
              cantidad: a.cantidad,
              descripcion: a.almacen?.articulo?.description,
              p_unitario: `$${(a.precio_venta ?? 0).toFixed(2)}`,
              p_unitario_number: a.precio_venta,
              importe: `$${((a.cantidad ?? 0) * (a.precio_venta ?? 0)).toFixed(2)}`,
            }
          }) || [];
          this.factura.formaPago = this.venta?.forma_pago?.name;
          this.factura.metodoPago = this.venta?.metodo_pago?.name;
          this.factura.moneda = this.venta?.moneda
          this.factura.uso_cfdi = this.venta?.uso_cfdi?.name;

          // Totales
          this.factura.descuento = descuento;
          this.ocultarDescuento = descuento != 0;

          this.factura.porcentajeIva = this.venta?.translada_iva ? (this.venta.translada_iva_porcentaje ?? 0) : 0;
          this.porcentajeIva = this.factura.porcentajeIva * 100;
          if(this.factura.porcentajeIva == 0)
            this.ocultarIva = false;

          this.factura.porcentajeRetiene = this.venta?.retiene_iva ? (this.venta.retiene_iva_porcentaje ?? 0) : 0;
          this.porcentajeRetiene = this.factura.porcentajeRetiene * 100;
          if(this.factura.porcentajeRetiene == 0)
            this.ocultarRetiene = false;

          this.factura.iva = this.calcularIva();
          this.factura.retiene = this.calcularRetiene();
          this.factura.subTotal = this.calcularSubTotal();
          this.factura.total = this.calcularTotal();


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
              producto_servicio: a.producto_servicio_id,
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

  calcularSubTotal(): float{
    let subTotal = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      subTotal += (articulo.p_unitario_number ?? 0) * (articulo.cantidad ?? 0);
    });
    return subTotal;
  }

  calcularIva(): float {
    if (this.factura?.porcentajeIva == 0 || !this.factura?.porcentajeIva == undefined)
      return 0;

    let iva = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      if (this.factura && this.factura.porcentajeIva) {
        iva += ((articulo.p_unitario_number ?? 0) * (articulo.cantidad ?? 0)) * this.factura.porcentajeIva;
      }
    });
    return iva;
  }

  calcularRetiene(): float {
    if (this.factura?.porcentajeRetiene == 0 || !this.factura?.porcentajeRetiene == undefined)
      return 0;

    let retiene = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      if (this.factura && this.factura.porcentajeRetiene) {
        retiene += ((articulo.p_unitario_number ?? 0) * (articulo.cantidad ?? 0)) * this.factura.porcentajeRetiene;
      }
    });
    return retiene;
  }

  calcularTotal(): float {
    return (this.factura?.subTotal ?? 0) - (this.factura?.descuento ?? 0) + (this.factura?.iva ?? 0) - (this.factura?.retiene ?? 0);
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