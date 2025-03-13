import { Injectable } from '@angular/core';  
import { environment } from '../../environments/environment';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { User } from '../interfaces/user';  

@Injectable({  
  providedIn: 'root',  
})  
export class LoginService {  
  private backendUrl = environment.backendUrl;  
  private backendAuthUrl = `${this.backendUrl}/auth/`;  
  private loginUrl = `${this.backendAuthUrl}login/`;  
  private logoutUrl = `${this.backendAuthUrl}logout/`;  
  private registrationUrl = `${this.backendAuthUrl}register/`;  
  private profileUrl = `${this.backendAuthUrl}profile/`;  

  constructor(private http: HttpClient) {}  

  // Метод для получения профиля пользователя  
  getUserProfile(): Observable<any> {  
    return this.http.get<any>(this.profileUrl, { withCredentials: true });  
  }  

  // Метод для регистрации пользователя  
  register(params: Object): Observable<User> {  
    return this.http.post<User>(this.registrationUrl, params);  
  }  

  // Метод для входа пользователя  
  login(username: string, password: string): Observable<any> {  
    return this.http.post<any>(this.loginUrl, {  
      username: username,  
      password: password,  
    }, { withCredentials: true });
  }  

  // Метод для выхода пользователя  
  logout(): Observable<void> {  
    const csrfToken = this.getCSRFToken();  
    return this.http.post<void>(  
      this.logoutUrl,  
      {},  
      {  
        headers: {  
          'X-CSRFToken': csrfToken || '',  
        },  
        withCredentials: true // Добавляем withCredentials для отправки куки  
      }  
    );  
  }  

  // Вспомогательный метод для получения CSRF токена из куки  
  private getCSRFToken(): string | null {  
    const name = 'csrftoken';  
    const value = `; ${document.cookie}`;  
    const parts = value.split(`; ${name}=`);  

    if (parts.length > 1) {  
      const tokenPart = parts[1].split(';')[0];  
      return tokenPart || null;  
    }  
    return null;  
  }  
}