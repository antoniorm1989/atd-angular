import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

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
    private userService: UserService
  ) {

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      remember: [false],
    });

  }

  ngOnInit() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      this.f['email'].setValue(rememberedUsername);
      this.f['remember'].setValue(true);
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/almacen';
  }

  get f() { return this.form!.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.f['remember'].value)
      localStorage.setItem('rememberedUsername', this.f['email'].value);
    else
      localStorage.removeItem('rememberedUsername');

    // stop here if form is invalid
    if (this.form!.invalid)
      return;

    this.loading = true;
    this.userService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (data) => {
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
}
