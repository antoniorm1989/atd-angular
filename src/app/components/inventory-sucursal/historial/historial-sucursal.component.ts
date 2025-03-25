import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { environment } from 'src/environments/environment';
import { InventorySucursalModel, InventorySucursalTransactionsModel } from 'src/app/models/inventory-sucursal.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DialogComponent } from '../../genericos/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InventorySucursalService } from 'src/app/services/inventory_sucursal.service';

@Component({
  selector: 'app-historial-sucursal',
  templateUrl: './historial-sucursal.component.html',
  styleUrls: ['./historial-sucursal.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class HistorialSucursalComponent {

  displayedColumns: string[] = ['created_at', 'added', 'type', 'qty', 'before_qty', 'current_qty', 'comment', 'user'];
  dataSource = new MatTableDataSource<InventorySucursalTransactionsModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataLoaded = false;

  inventorySucursalModel: InventorySucursalModel | null = null;
  imageUrl: string | null = null;
  hasRecords = false;

  constructor(
    private route: ActivatedRoute,
    private inventorySucursalService: InventorySucursalService,
    private router: Router,
    private dialog: MatDialog) {
  }

  ngOnInit() {

    const inventorySucursalId = this.route.snapshot.paramMap.get('id');
    if (inventorySucursalId != undefined) {

      this.inventorySucursalService.getById(parseInt(inventorySucursalId)).subscribe({
        next: (data) => {
          this.inventorySucursalModel = data;

          if (this.inventorySucursalModel) {

            if (this.inventorySucursalModel.articulo && this.inventorySucursalModel.articulo.photo)
              this.imageUrl = `${environment.apiUrl}/images/articulos/${this.inventorySucursalModel.articulo.photo}`;

            if (this.inventorySucursalModel.sucursal && this.inventorySucursalModel.articulo)
              this.inventorySucursalService.getInventoryTransactions(this.inventorySucursalModel.sucursal.id, this.inventorySucursalModel.articulo.id).subscribe({
                next: (data) => {
                  if (data.length > 0) {
                    this.hasRecords = true;
                    this.dataSource = new MatTableDataSource<InventorySucursalTransactionsModel>(data);
                    this.dataSource.paginator = this.paginator;
                    this.dataLoaded = true;
                  } else
                    this.hasRecords = false;
                }
              });
          }
        }
      });

    }

  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  getStock(): number {
    return this.inventorySucursalModel?.inventory_transaction?.[0]?.stock || 0;
  }

  showStockIndicator(): boolean {
    return this.getStock() < (this.inventorySucursalModel?.minimum_stock || 0);
  }

  getUserName(name: string, last_name: string): string {
    return name[0].toUpperCase() + last_name[0].toUpperCase();
  }

  formatDate(stringDate: string): string {
    const date = new Date(stringDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}/${day}/${year}`;
  }

  openDialog(comment: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { title: 'Detalle comentario', content: comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
    });
  }

  getUrlPhoto(photo: string): string {
    return `${environment.apiUrl}/images/users/${photo}`;
  }

}

