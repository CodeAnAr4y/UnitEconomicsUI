import { Injectable } from '@angular/core';  
import {  
  HttpInterceptor,  
  HttpRequest,  
  HttpHandler,  
  HttpEvent  
} from '@angular/common/http';  
import { Observable } from 'rxjs';  

@Injectable()  
export class CsrfInterceptor implements HttpInterceptor {  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {  
    const csrfToken = this.getCookie('csrftoken');  
    if (csrfToken) {  
      req = req.clone({  
        setHeaders: {  
          'X-CSRFToken': csrfToken  
        }  
      });  
    }  
    return next.handle(req);  
  }  

  // Функция для извлечения значения куки по имени  
  private getCookie(name: string): string | null {  
    const matches = document.cookie.match(new RegExp(  
      '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'  
    ));  
    return matches ? decodeURIComponent(matches[1]) : null;  
  }  
}  