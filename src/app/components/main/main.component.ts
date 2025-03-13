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
  ],  
  templateUrl: './main.component.html',  
  styleUrls: ['./main.component.scss'],  
})  
export class MainComponent implements OnInit {  
  searchValue: string = '';  
  user: User = { id: 1, username: 'test', email: 'test@test.test' };  
  products: Product[] = [];  

  // Тестовые данные для OZON  
  // ozonProducts: any[] = [  
  //   {  
  //     sellerArticle: 'OZON-001',  
  //     volume: 100,  
  //     status: 'Available',  
  //     salePrice: 250,  
  //     ozonCommissionPercent: 5,  
  //     ozonCommissionRub: 12.5,  
  //     ozonLogisticsRub: 15,  
  //     fbsReception: 'Completed',  
  //     packaging: 'Standard',  
  //     acquiringPercent: 1.5,  
  //     lastMile: 20,  
  //     drr15: 15,  
  //     managementService7: 7,  
  //     revenue: 300,  
  //     grossProfitPerUnit: 50,  
  //     marginPercent: 16.67,  
  //     costByn: 200,  
  //     costRub: 700,  
  //     orders: 150,  
  //     orderSumRevenue: 45000,  
  //     expenses: 3000,  
  //     tax: 500,  
  //     netProfit: 2500  
  //   },  
  //   {  
  //     sellerArticle: 'OZON-002',  
  //     volume: 200,  
  //     status: 'Out Of Stock',  
  //     salePrice: 350,  
  //     ozonCommissionPercent: 6,  
  //     ozonCommissionRub: 21,  
  //     ozonLogisticsRub: 20,  
  //     fbsReception: 'Pending',  
  //     packaging: 'Premium',  
  //     acquiringPercent: 1.5,  
  //     lastMile: 25,  
  //     drr15: 20,  
  //     managementService7: 8,  
  //     revenue: 400,  
  //     grossProfitPerUnit: 60,  
  //     marginPercent: 15,  
  //     costByn: 250,  
  //     costRub: 800,  
  //     orders: 100,  
  //     orderSumRevenue: 40000,  
  //     expenses: 3500,  
  //     tax: 600,  
  //     netProfit: 2800  
  //   }  
  // ];  

  // Тестовые данные для Wildberries  
  // wildberriesProducts: any[] = [  
  //   {  
  //     sellerArticle: 'WB-001',  
  //     category: 'Electronics',  
  //     barcode: '1234567890123',  
  //     fboRemains: 50,  
  //     purchasePriceUnitByn: 100,  
  //     purchasePriceUnitRub: 350,  
  //     priceByn: 150,  
  //     priceWithSPP_Byn: 160,  
  //     priceWithSPP_Rub: 380,  
  //     spp: 'SPP Info',  
  //     priceRub: 400,  
  //     salePriceRub: 420,  
  //     ourDiscount: 10,  
  //     roi: 12,  
  //     margin: 15,  
  //     profitRub: 80,  
  //     profitByn: 20,  
  //     tax20RosRub: 84,  
  //     tax20Byn: 21,  
  //     dimensions: '10x20x30',  
  //     volumeL: 2,  
  //     logisticsToCustomerRub: 30,  
  //     logisticWarehouseCoef: 1.1,  
  //     storageWarehouseCoef: 1.2,  
  //     wildberriesCommissionPercent: 15,  
  //     wildberriesCommissionRub: 60,  
  //     acquiring2PercentRub: 8,  
  //     packagingByn: 2,  
  //     management7PercentByn: 5,  
  //     fbsReception: 'Completed',  
  //     deliveryToWBRub: 25,  
  //     storage: 12,  
  //     storage30Days: 50,  
  //     revenueRosRub: 500  
  //   },  
  //   {  
  //     sellerArticle: 'WB-002',  
  //     category: 'Clothing',  
  //     barcode: '9876543210987',  
  //     fboRemains: 30,  
  //     purchasePriceUnitByn: 80,  
  //     purchasePriceUnitRub: 300,  
  //     priceByn: 120,  
  //     priceWithSPP_Byn: 130,  
  //     priceWithSPP_Rub: 320,  
  //     spp: 'SPP Text',  
  //     priceRub: 350,  
  //     salePriceRub: 360,  
  //     ourDiscount: 5,  
  //     roi: 10,  
  //     margin: 12,  
  //     profitRub: 50,  
  //     profitByn: 15,  
  //     tax20RosRub: 70,  
  //     tax20Byn: 18,  
  //     dimensions: '15x25x35',  
  //     volumeL: 1.5,  
  //     logisticsToCustomerRub: 28,  
  //     logisticWarehouseCoef: 1.05,  
  //     storageWarehouseCoef: 1.15,  
  //     wildberriesCommissionPercent: 14,  
  //     wildberriesCommissionRub: 55,  
  //     acquiring2PercentRub: 7,  
  //     packagingByn: 1.8,  
  //     management7PercentByn: 4,  
  //     fbsReception: 'Completed',  
  //     deliveryToWBRub: 20,  
  //     storage: 10,  
  //     storage30Days: 40,  
  //     revenueRosRub: 450  
  //   }  
  // ];  

  // Описание столбцов для OZON и Wildberries (также используется для формы добавления товара)  
  ozonColumns = [  
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

  wildberriesColumns = [  
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

  // Форма фильтров (без изменений)  
  filtersForm = new FormGroup({  
    itemName: new FormControl('', Validators.required),  
    quantity: new FormControl('', Validators.required),  
    property: new FormControl('', Validators.required),  
    filterBy: new FormControl('', Validators.required),  
    marketplace: new FormControl('OZON', Validators.required),  
  });  

  /* Форма добавления товара:  
     - Добавлен контрол "marketplace" для выбора площадки.  
     - Контролы для всех возможных полей добавляются динамически.  
     В шаблоне при выборе площадки показываются только соответствующие поля.  
  */  
  productForm: FormGroup = new FormGroup({  
    marketplace: new FormControl('OZON', Validators.required),  
  });  

  addProductWindow: boolean = false;  

  constructor(  
    public router: Router,  
    private http: HttpClient,  
    public dialog: MatDialog,  
    private loginService: LoginService,
    private productService: ProductService
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

    // Инициализируем форму добавления товара: добавляем контролы по описаниям столбцов.  
    this.ozonColumns.forEach(col => {  
      this.productForm.addControl(col.key, new FormControl('', Validators.required));  
    });  
    this.wildberriesColumns.forEach(col => {  
      // Если для OZON и Wildberries некоторые контролы совпадают, контрол добавится один раз.  
      if (!this.productForm.contains(col.key)) {  
        this.productForm.addControl(col.key, new FormControl('', Validators.required));  
      }  
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
      },  
    });  
  
    dialogRef.afterClosed().subscribe((result: any) => {  
      if (result) {  
        const { marketplace, ...details } = result;  
        const productPayload = { marketplace, details };  
  
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
}