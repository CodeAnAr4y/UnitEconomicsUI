import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id?: number;
  marketplace: string;
  details: { [key: string]: any };
  seller?: number;
  manager?: number;
  created_at?: string; // время создания может быть строкой (ISO формат)
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private backendUrl = environment.backendUrl;
  private productsUrl = this.backendUrl + '/api/products';

  constructor(private http: HttpClient) {}

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.productsUrl}/add/`, product);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.productsUrl}/all/`);
  }

  updateProduct(product: Product): Observable<Product> {
    if (!product.id) {
      throw new Error('ID продукта обязателен для обновления');
    }
    return this.http.put<Product>(
      `${this.productsUrl}/update/${product.id}/`,
      product
    );
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.productsUrl}/delete/${productId}/`);
  }
}
