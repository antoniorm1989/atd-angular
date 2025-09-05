import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancelar-factura',
  templateUrl: './cancelar-factura.component.html',
  styleUrls: ['./cancelar-factura.component.css']
})
export class CancelarFacturaComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  motivosCancelacion: any[] = [];
  folioFactura: string = 'F65';

  // UUID Pattern for validation
  private uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CancelarFacturaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.folioFactura = data?.folio || 'F65';
  }

  ngOnInit() {
    this.form = this.fb.group({
      motivo_cancelacion: ['', Validators.required],
      uuid_sustitucion: [''] // Initially without validators
    });

    this.loadMotivosCancelacion();
    this.setupFormValidation();
  }

  loadMotivosCancelacion() {
    this.motivosCancelacion = [
      { clave: '01', descripcion: 'Comprobante emitido con errores con relación' },
      { clave: '02', descripcion: 'Comprobante emitido con errores sin relación' },
      { clave: '03', descripcion: 'No se llevó a cabo la operación' },
      { clave: '04', descripcion: 'Operación nominativa relacionada en una factura global' }
    ];
  }

  setupFormValidation() {
    // Listen for changes in motivo_cancelacion to update UUID field validation
    this.form.get('motivo_cancelacion')?.valueChanges.subscribe(selectedMotivo => {
      const uuidControl = this.form.get('uuid_sustitucion');

      if (selectedMotivo && selectedMotivo.clave === '01') {
        // Option 1 selected - UUID is required
        uuidControl?.setValidators([
          Validators.required,
          Validators.pattern(this.uuidPattern)
        ]);
      } else {
        // Other options - UUID is not required
        uuidControl?.clearValidators();
        uuidControl?.setValue(''); // Clear the value
      }
      
      uuidControl?.updateValueAndValidity();
    });
  }

  // Method to check if UUID input should be shown
  showUuidInput(): boolean {
    const selectedMotivo = this.form.get('motivo_cancelacion')?.value;
    return selectedMotivo && selectedMotivo.clave === '01';
  }

  get f() { return this.form.controls; }

  onAdd() {
    this.submitted = true;
    
    if (this.form.valid) {
      const result = {
        canceled: true,
        motivo: this.f['motivo_cancelacion'].value,
        uuid_sustitucion: this.showUuidInput() ? this.f['uuid_sustitucion'].value : null
      };
      this.dialogRef.close(result);
    }
  }

  onCancel() {
    this.dialogRef.close({ canceled: false });
  }
}