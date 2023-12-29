import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Event } from '@angular/router';
import { InventoryAlmacenService } from 'src/app/services/inventory.service';
import { environment } from 'src/environments/environment';
import { InventoryAlmacenModel, InventoryAlmacenTransactionsModel } from 'src/app/models/inventory-almacen.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DialogComponent } from '../../genericos/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-historial-almacen',
  templateUrl: './historial-almacen.component.html',
  styleUrls: ['./historial-almacen.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class HistorialAlmacenComponent {

  displayedColumns: string[] = ['created_at', 'added', 'type', 'qty', 'before_qty', 'current_qty', 'comment', 'user'];
  dataSource = new MatTableDataSource<InventoryAlmacenTransactionsModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataLoaded = false;

  inventoryAlmacenModel: InventoryAlmacenModel | null = null;
  imageUrl: string | null = null;
  hasRecords = false;

  constructor(
    private route: ActivatedRoute,
    private inventoryAlmacenService: InventoryAlmacenService,
    private router: Router,
    private dialog: MatDialog) {
  }

  ngOnInit() {

    const inventoryAlmacenId = this.route.snapshot.paramMap.get('id');
    if (inventoryAlmacenId != undefined) {

      this.inventoryAlmacenService.getById(parseInt(inventoryAlmacenId)).subscribe({
        next: (data) => {
          this.inventoryAlmacenModel = data;

          if (this.inventoryAlmacenModel) {

            if (this.inventoryAlmacenModel.articulo && this.inventoryAlmacenModel.articulo.photo)
              this.imageUrl = `${environment.apiUrl}images/articulos/${this.inventoryAlmacenModel.articulo.photo}`;

            if (this.inventoryAlmacenModel.almacen && this.inventoryAlmacenModel.articulo)
              this.inventoryAlmacenService.getInventoryTransactions(this.inventoryAlmacenModel.almacen.id, this.inventoryAlmacenModel.articulo.id).subscribe({
                next: (data) => {
                  if (data.length > 0) {
                    this.hasRecords = true;
                    this.dataSource = new MatTableDataSource<InventoryAlmacenTransactionsModel>(data);
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
    return this.inventoryAlmacenModel?.inventory_transaction?.[0]?.stock || 0;
  }

  showStockIndicator(): boolean {
    return this.getStock() < (this.inventoryAlmacenModel?.minimum_stock || 0);
  }

  getUserName(name: string, lastname: string): string {
    return name[0].toUpperCase() + lastname[0].toUpperCase();
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

}

