import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';  
import { provideRouter } from '@angular/router';  
import { HTTP_INTERCEPTORS, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';  
import { provideHttpClient } from '@angular/common/http';  

import { routes } from './app.routes';  
import { CsrfInterceptor } from './interceptors/csrf.interceptor';  
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {  
  providers: [  
    provideZoneChangeDetection({ eventCoalescing: true }),  
    provideRouter(routes),  
    provideHttpClient(withInterceptorsFromDi()),  
    {  
      provide: HTTP_INTERCEPTORS,  
      useClass: CsrfInterceptor,  
      multi: true,  
    },  
    {  
      provide: HTTP_INTERCEPTORS,  
      useClass: CredentialsInterceptor,  
      multi: true,  
    },  
  ],  
};