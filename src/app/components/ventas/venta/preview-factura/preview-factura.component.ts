import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { float } from '@zxing/library/esm/customTypings';
import { FacturaModel, ReceptorModel } from 'src/app/models/factura.model';
import { VentaArticuloModel } from 'src/app/models/ventas.model';
import { VentaService } from 'src/app/services/ventas.service';


@Component({
  selector: 'app-preview-factura',
  templateUrl: './preview-factura.component.html',
  styleUrls: ['./preview-factura.component.css']
})

export class PreviewFacturaComponent implements OnInit, OnDestroy {

  @Output() cancel = new EventEmitter();
  @Output() add = new EventEmitter<FacturaModel>();
  @Input() ventaId: number = 0;
  factura: FacturaModel | undefined;


  displayedColumns: string[] = ['unidad', 'producto_servicio', 'cantidad', 'descripcion', 'p_unitario', 'importe'];
  dataSourceArticulos = new MatTableDataSource<any>([]);

  constructor(private dialog: MatDialog, private ventaService: VentaService) {
  }

  ngOnInit() {
    try {
      this.ventaService.getVentaById(this.ventaId).subscribe({
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

  calcularSubTotal(): float{
    let subTotal = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      subTotal += (articulo.p_unitario_number ?? 0) * (articulo.cantidad ?? 0);
    });
    return subTotal;
  }

  calcularIva(): float {
    let iva = 0;
    this.dataSourceArticulos.data.forEach(articulo => {
      iva += ((articulo.p_unitario_number ?? 0) * (articulo.cantidad ?? 0)) * .16;
    });
    return iva;
  }

  calcularTotal() {
    return this.calcularSubTotal() + this.calcularIva();
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
}