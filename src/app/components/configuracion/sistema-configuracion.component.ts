import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SistemaConfigurationService } from 'src/app/services/system-configuracion.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from '../genericos/snack-message.component';
import { SystemConfigurationModel } from 'src/app/models/system-configuration-model';

@Component({
  selector: 'app-configuracion',
  templateUrl: './sistema-configuracion.component.html',
  styleUrls: ['./sistema-configuracion.component.css'],
})
export class SistemaConfiguracionComponent implements OnInit {
  form: FormGroup = this.fb.group({});
  configuraciones: SystemConfigurationModel[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private sistemaConfigurationService: SistemaConfigurationService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadConfiguraciones();
  }

  loadConfiguraciones(): void {
    this.sistemaConfigurationService.getAll().subscribe({
      next: (data: SystemConfigurationModel[]) => {
        this.configuraciones = data;
        data.forEach(config => {
          this.form.addControl(config.name, this.fb.control(config.value, Validators.required));
        });
      },
      error: () => this.openSnackBarError('Error al cargar configuraciones.')
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const configuracionesActualizadas: SystemConfigurationModel[] = this.configuraciones.map(config => ({
      id: config.id,
      name: config.name,
      value: this.form.get(config.name)?.value,
      category: "ventas"
    }));

    this.sistemaConfigurationService.updateAll(configuracionesActualizadas).subscribe({
      next: () => {
        this.loading = false;
        this.openSnackBarSuccess('Configuraciones actualizadas correctamente.');

        let userData = JSON.parse(localStorage.getItem('user_data')?.toString() || '{}');
        if (userData && userData.configuraciones && userData.configuraciones.length > 0) {
          userData.configuraciones = userData.configuraciones.map((config: SystemConfigurationModel) => {
            const updatedConfig = configuracionesActualizadas.find((updated: SystemConfigurationModel) => updated.name === config.name);
            if (updatedConfig) {
              return { ...config, value: updatedConfig.value };
            }
            return config;
          });
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
      },
      error: () => {
        this.loading = false;
        this.openSnackBarError('Ocurrió un error al actualizar.');
      }
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

  openSnackBarSuccess(message: string) {
    this._snackBar.open(message, 'cerrar', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
      duration: 5000,
    });
  }

  consultarDOF() {
    window.open('https://dof.gob.mx/indicadores.php#gsc.tab=0', '_blank');
  }

}
