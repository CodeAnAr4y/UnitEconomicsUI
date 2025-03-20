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

@Component({  
  selector: 'app-login',  
  standalone: true,  
  imports: [CommonModule, ReactiveFormsModule],  
  templateUrl: './login.component.html',  
  styleUrls: ['./login.component.scss'],  
})  
export class LoginComponent implements OnInit {  
  user: any;  
  signUp: boolean = false;  
  role = 'покупатель';  

  // Объекты для хранения ошибок  
  registrationErrors: any = {};  
  loginErrors: any = {};  

  registrationForm = new FormGroup({  
    username: new FormControl('', Validators.required),  
    email: new FormControl('', [Validators.required, Validators.email]),  
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
      username: formData.username || '',  
      password: formData.password || '',  
      email: formData.email || '',  
    };  

    // Сбрасываем предыдущие ошибки  
    this.registrationErrors = {};  

    this.loginService.register(user).subscribe(  
      (result: User) => {  
        this.router.navigate(['']);  
      },  
      (error) => {  
        // Предположим, что ошибки приходят в формате JSON, например:  
        // { "username": ["This field may not be blank."], "password": ["This field may not be blank."] }  
        if (error.error) {  
          this.registrationErrors = error.error;  
        } else {  
          this.registrationErrors = { general: 'Произошла ошибка. Попробуйте ещё раз.' };  
        }  
      }  
    );  
  }  

  login() {  
    const login = this.loginForm.value.username || '';  
    const pass = this.loginForm.value.password || '';  

    // Сбрасываем предыдущие ошибки  
    this.loginErrors = {};  

    this.loginService.login(login, pass).subscribe(  
      (res: User) => {  
        console.log(res);  
        this.router.navigate(['']);  
      },  
      (error) => {  
        if (error.error) {  
          this.loginErrors = error.error;  
          console.log(this.loginErrors);
        } else {  
          this.loginErrors = { general: 'Произошла ошибка. Попробуйте ещё раз.' };  
        }  
      }  
    );  
  }  
}