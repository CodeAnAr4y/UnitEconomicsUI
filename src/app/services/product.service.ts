import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';  
import { environment } from '../../environments/environment';

// Определим интерфейс для товара для типизации данных  
export interface Product {  
  id?: number; // будет возвращено сервером (если есть)  
  marketplace: string;  
  details: { [key: string]: any };  
  created_at?: string; // время создания может быть строкой (ISO формат)  
}  

@Injectable({  
  providedIn: 'root',  
})  
export class ProductService {  
    private backendUrl = environment.backendUrl; 
    private productsUrl = this.backendUrl + "/api/products" 
  

  constructor(private http: HttpClient) {}  

  /**  
   * Создание нового товара.  
   * @param product Объект товара, который содержит поля: marketplace и details.  
   */  
  addProduct(product: Product): Observable<Product> {  
    return this.http.post<Product>(`${this.productsUrl}/add/`, product, {withCredentials: true});  
  }  

  /**  
   * Получение списка всех товаров.  
   */  
  getProducts(): Observable<Product[]> {  
    return this.http.get<Product[]>(`${this.productsUrl}/all/`, {withCredentials: true});  
  }  
}