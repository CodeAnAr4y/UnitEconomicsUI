import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Seller {
  id?: number;
  name: string;
  manager?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  // URL для получения и добавления продавцов
  private backendUrl = environment.backendUrl;
  private sellersUrl = this.backendUrl + '/api/sellers';

  constructor(private http: HttpClient) {}

  /**
   * Получение всех продавцов
   * GET http://localhost:8000/api/sellers/all/
   */
  getAllSellers(): Observable<Seller[]> {
    return this.http.get<Seller[]>(`${this.sellersUrl}/all/`);
  }

  /**
   * Добавление нового продавца
   * POST http://localhost:8000/api/sellers/add/
   * @param seller - объект нового продавца
   */
  addSeller(seller: Seller): Observable<Seller> {
    return this.http.post<Seller>(`${this.sellersUrl}/add/`, seller);
  }
}
