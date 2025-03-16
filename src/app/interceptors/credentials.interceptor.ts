import { Injectable } from '@angular/core';  
import {  
  HttpInterceptor,  
  HttpRequest,  
  HttpHandler,  
  HttpEvent  
} from '@angular/common/http';  
import { Observable } from 'rxjs';  

@Injectable()  
export class CredentialsInterceptor implements HttpInterceptor {  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {  
    // Клонируем запрос с флагом withCredentials: true  
    const modifiedReq = req.clone({  
      withCredentials: true  
    });  
    return next.handle(modifiedReq);  
  }  
}