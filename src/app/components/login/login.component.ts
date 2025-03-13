import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  user: any;
  signUp: boolean = false;
  role = 'покупатель';

  registrationForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(
    public loginService: LoginService,
    public router: Router,
    private cookie: CookieService
  ) {}

  ngOnInit(): void {}

  registrate() {
    const formData = this.registrationForm.value;
    const user = {
      username: formData.username ? formData.username : '',
      password: formData.password ? formData.password : '',
      email: formData.email ? formData.email : '',
    };
    console.log(user);
    this.loginService.register(user).subscribe(
      (result: User) => {
        this.router.navigate(['']);
      },
      (error) => {}
    );
  }

  login() {
    const login = this.loginForm.value.username
      ? this.loginForm.value.username
      : '';
    const pass = this.loginForm.value.password
      ? this.loginForm.value.password
      : '';
    this.loginService.login(login, pass).subscribe(
      (res: User) => {
        console.log(res);
        this.router.navigate(['']);
      },
      (error) => {
        alert(error);
      }
    );
  }
}
