import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MessageComponent } from './snack-message.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class LoginComponent implements OnInit {

  form: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string | undefined;
  hidePassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false],
    });

  }

  ngOnInit() {
    const rememberedCredentials = localStorage.getItem('rememberedCredentials');
    if (rememberedCredentials) {
      let rememberedCredentialsJson =  JSON.parse(rememberedCredentials);
      this.f['email'].setValue(rememberedCredentialsJson.email);
      this.f['password'].setValue(rememberedCredentialsJson.password);
      this.f['remember'].setValue(true);
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/almacen';
  }

  get f() { return this.form!.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.f['remember'].value)
      localStorage.setItem('rememberedCredentials', JSON.stringify({ email: this.f['email'].value, password: this.f['password'].value }));
    else
      localStorage.removeItem('rememberedCredentials');

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    this.loading = true;
    this.userService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.openMessageSnack();
          localStorage.setItem('user_data', JSON.stringify(data));
          this.router.navigate([this.returnUrl]);
        },
        error: (e) => {
          this.loading = false;
        }
      });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  openMessageSnack() {
    const config: MatSnackBarConfig = {
      duration: 5000,
      data: {
      },
    };

    // Sanitize the HTML content
    const sanitizedMessage = this.sanitizer.bypassSecurityTrustHtml(config.data.message);
    config.data.message = sanitizedMessage;

    this._snackBar.openFromComponent(MessageComponent, config);
  }
}
