import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginService } from '../../services/login.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AddProductDialogComponent } from '../add-product-dialog/add-product-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { Product, ProductService } from '../../services/product.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';  
import { Seller, SellerService } from '../../services/seller.service';
import { AddSellerDialogComponent } from '../add-seller-dialog/add-seller-dialog.component';

export const ozonColumns = [
  { header: 'Артикул продавца', key: 'sellerArticle' },
  { header: 'Объем', key: 'volume' },
  { header: 'Статус', key: 'status' },
  { header: 'Цена реализации', key: 'salePrice' },
  { header: 'Комиссия OZON, %', key: 'ozonCommissionPercent' },
  { header: 'Комиссия OZON, Р', key: 'ozonCommissionRub' },
  { header: 'Логистика OZON, Р', key: 'ozonLogisticsRub' },
  { header: 'Приемка ФБС', key: 'fbsReception' },
  { header: 'Упаковка', key: 'packaging' },
  { header: 'Эквайринг 1,5%', key: 'acquiringPercent' },
  { header: 'Последняя миля', key: 'lastMile' },
  { header: 'ДРР (15%)', key: 'drr15' },
  { header: 'Услуга ведения 7%', key: 'managementService7' },
  { header: 'Выручка', key: 'revenue' },
  { header: 'Вал. приб/шт, Р', key: 'grossProfitPerUnit' },
  { header: 'Маржа, %', key: 'marginPercent' },
  { header: 'Себестоимость BYN', key: 'costByn' },
  { header: 'Себестоимость в RUB', key: 'costRub' },
  { header: 'Заказы, шт (продажи)', key: 'orders' },
  { header: 'Сумма заказа (выручка), Р', key: 'orderSumRevenue' },
  { header: 'Расходы, Р', key: 'expenses' },
  { header: 'Налог', key: 'tax' },
  { header: 'Чист. прибл., Р', key: 'netProfit' },
];

export const wildberriesColumns = [
  { header: 'Артикул продавца', key: 'sellerArticle' },
  { header: 'Категория', key: 'category' },
  { header: 'Баркод', key: 'barcode' },
  { header: 'Остатки ФБО', key: 'fboRemains' },
  { header: 'закупочная 1ед товара в BYN', key: 'purchasePriceUnitByn' },
  { header: 'закупочная 1ед товара в RUB', key: 'purchasePriceUnitRub' },
  { header: 'цена, BYN', key: 'priceByn' },
  { header: 'Цена с спп BYN', key: 'priceWithSPP_Byn' },
  { header: 'Цена с спп RUB', key: 'priceWithSPP_Rub' },
  { header: 'Спп', key: 'spp' },
  { header: 'цена RUB', key: 'priceRub' },
  { header: 'Цена реализации RUB', key: 'salePriceRub' },
  { header: 'Скидка наша', key: 'ourDiscount' },
  { header: 'ROI', key: 'roi' },
  { header: 'Маржинальность', key: 'margin' },
  { header: 'Прибыль RUB', key: 'profitRub' },
  { header: 'Прибыль BYN', key: 'profitByn' },
  { header: 'Налог 20%, рос руб', key: 'tax20RosRub' },
  { header: 'Налог 20%, BYN', key: 'tax20Byn' },
  { header: 'ДхШхВ, см', key: 'dimensions' },
  { header: 'Объем л', key: 'volumeL' },
  { header: 'Логистика до покупателя RUB', key: 'logisticsToCustomerRub' },
  { header: 'Коэф. склада логистика', key: 'logisticWarehouseCoef' },
  { header: 'Коэф. склада хранение', key: 'storageWarehouseCoef' },
  { header: 'комиссия вб, %', key: 'wildberriesCommissionPercent' },
  { header: 'комиссия вб RUB', key: 'wildberriesCommissionRub' },
  { header: 'Эквайринг 2% RUB', key: 'acquiring2PercentRub' },
  { header: 'Упаковка, BYN', key: 'packagingByn' },
  { header: 'Ведение 7%, BYN', key: 'management7PercentByn' },
  { header: 'Приемка', key: 'fbsReception' },
  { header: 'Доставка до WB, RUB', key: 'deliveryToWBRub' },
  { header: 'Хранение', key: 'storage' },
  { header: 'Хранение за 30 дней', key: 'storage30Days' },
  { header: 'выручка в рос руб', key: 'revenueRosRub' },
];

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,  
    MatSelectModule,  
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  searchValue: string = '';
  user: User = { id: 1, username: 'test', email: 'test@test.test' };
  products: Product[] = [];
  sellers: Seller[] = []; 

  ozonColumns = ozonColumns;

  wildberriesColumns = wildberriesColumns;

  // Форма фильтров
  filtersForm = new FormGroup({
    itemName: new FormControl('', Validators.required),
    quantity: new FormControl('', Validators.required),
    property: new FormControl('', Validators.required),
    filterBy: new FormControl('', Validators.required),
    marketplace: new FormControl('OZON', Validators.required),
    seller: new FormControl('', Validators.required),
  });

  productForm: FormGroup = new FormGroup({
    marketplace: new FormControl('OZON', Validators.required),
  });

  addProductWindow: boolean = false;

  constructor(
    public router: Router,
    private http: HttpClient,
    public dialog: MatDialog,
    private loginService: LoginService,
    private productService: ProductService,
    private sellerService: SellerService,
  ) {}

  ngOnInit(): void {
    this.loginService.getUserProfile().subscribe(
      (data) => {
        this.user = data;
      },
      (error) => {
        this.router.navigate(['login']);
      }
    );
    this.loadSellers();

    this.ozonColumns.forEach((col) => {
      this.productForm.addControl(
        col.key,
        new FormControl('', Validators.required)
      );
    });
    this.wildberriesColumns.forEach((col) => {
      this.productForm.addControl(
        col.key,
        new FormControl('', Validators.required)
      );
    });

    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error('Ошибка загрузки товаров', err);
      },
    });
  }

  loadSellers(){
    this.sellerService.getAllSellers().subscribe(
      (data) => {
        this.sellers = data;
      },
      (error) => {console.error(error)}
    )
  }

  search() {
    console.log(this.searchValue);
  }

  applyFilters() {
    console.log('Фильтры:', this.filtersForm.value);
  }

  openAddProductDialog(): void {  
    const dialogRef = this.dialog.open(AddProductDialogComponent, {  
      width: '60%',  
      panelClass: 'custom-dialog-container',  
      data: {  
        ozonColumns: this.ozonColumns,  
        wildberriesColumns: this.wildberriesColumns,  
        sellers: this.sellers,  
      },  
    });  
  
    dialogRef.afterClosed().subscribe((result: any) => {  
      if (result) {  
        const { marketplace, seller, ...details } = result;  
        const productPayload = { marketplace, seller, details };  
  
        this.productService.addProduct(productPayload).subscribe({  
          next: (newProduct: any) => {  
            console.log('Добавлен товар:', newProduct);  
            this.loadProducts();  
          },  
          error: (err) => {  
            console.error('Ошибка добавления товара', err);  
          },  
        });  
      }  
    });  
  }  

  openAddSellerDialog(): void {  
    const dialogRef = this.dialog.open(AddSellerDialogComponent, {  
      width: '40%',  
      panelClass: 'custom-dialog-container',  
      data: {}  
    });  
  
    dialogRef.afterClosed().subscribe((result: any) => {  
      if (result) {  
        this.sellerService.addSeller({ name: result.sellerName }).subscribe({  
          next: (newSeller: any) => {  
            console.log('Продавец добавлен:', newSeller);  
            this.loadSellers();
          },  
          error: (err) => {  
            console.error('Ошибка добавления продавца', err);  
          },  
        });  
      }  
    });  
  }  
}
