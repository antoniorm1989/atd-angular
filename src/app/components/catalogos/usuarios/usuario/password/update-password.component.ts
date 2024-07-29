import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogoArticuloModel } from 'src/app/models/catalogo-articulo.model';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})

export class UpdatePasswordComponent {

  action: string = 'Actualizar';
  form: FormGroup;
  submitted = false;

  @Output() cancel = new EventEmitter();
  @Output() update = new EventEmitter<boolean>();
  @Input() userId: string = '0';

  constructor(public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService) {

    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  get f() { return this.form!.controls; }

  navigate(route: string) {
    try {
      this.router.navigate([route]);
    } catch (error) {
      console.error('An error occurred in navigate:', error);
    }
  }

  onSubmit() {
    try {
      this.submitted = true;
      if (this.form!.invalid)
        return;

      let user = new User();
      user.id = this.userId;
      user.password = this.form.value.password;
      user.isPasswordTemp = true;

      this.userService.updatePassword(user).subscribe({
        next: (data) => {
          this.update.emit(true);
        }
      });

    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }

  onCancel() {
    try {
      this.update.emit(false);
    } catch (error) {
      console.error('An error occurred in onSubmit:', error);
    }
  }
}
