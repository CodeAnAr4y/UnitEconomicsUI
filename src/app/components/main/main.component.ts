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
import { ReportService } from '../../services/report.service';


export const ozonColumns = [
  { header: 'Артикул продавца', key: 'sellerArticle' },
  { header: 'Объем', key: 'volume' },
  { header: 'Статус', key: 'status' },
  { header: 'Цена реализации', key: 'salePrice' },
  { header: 'Комиссия OZON, %', key: 'ozonCommissionPercent' },
  { header: 'Комиссия OZON, Р', key: 'ozonCommissionRub' }, // Цена реализации * Комиссия OZON, %
  { header: 'Логистика OZON, Р', key: 'ozonLogisticsRub' }, // if (Объем > 1) {76} else {76 + (Объем - 1) * 12}
  { header: 'Приемка ФБС', key: 'fbsReception' }, // 30
  { header: 'Упаковка', key: 'packaging' }, // 27.18
  { header: 'Эквайринг 1,5%', key: 'acquiringPercent' }, // Цена реализации * 0.015
  { header: 'Последняя миля', key: 'lastMile' }, // =ЕСЛИ(ЕСЛИ(Цена реализации*5,5%<20;20;Цена реализации*5,5%)>500;500;ЕСЛИ(Цена реализации*5,5%<20;20;Цена реализации*5,5%))
  { header: 'Услуга ведения 7%', key: 'managementService7' }, // Выручка * 0.07
  { header: 'Выручка', key: 'revenue' }, // Цена реализации - Логистика OZON, Р - Эквайринг 1,5% - Последняя миля - Комиссия OZON, Р
  { header: 'Вал. приб/шт, Р', key: 'grossProfitPerUnit' }, // Цена реализации - Комиссия OZON, Р - Логистика OZON, Р - Приемка ФБС - Себестоимость в RUB - Упаковка - Эквайринг 1,5% - Последняя миля - Услуга ведения 7%
  { header: 'Маржа, %', key: 'marginPercent' }, // =ЕСЛИОШИБКА(Чист. прибл., Р/Себестоимость в RUB; "")
  { header: 'Себестоимость BYN', key: 'costByn' },
  { header: 'Себестоимость в RUB', key: 'costRub' },
  { header: 'Заказы, шт (продажи)', key: 'orders' }, // 1
  { header: 'Сумма заказа (выручка), Р', key: 'orderSumRevenue' }, // Цена реализации * Заказы, шт (продажи)
  { header: 'Расходы, Р', key: 'expenses' }, // (Комиссия OZON, Р + Логистика OZON, Р + Приемка ФБС + Себестоимость в RUB + Упаковка + Эквайринг 1,5% + Последняя миля + Услуга ведения 7%) * Заказы, шт (продажи)
  { header: 'Налог', key: 'tax' }, // Цена реализации / 6
  { header: 'Чист. прибл., Р', key: 'netProfit' }, // Сумма заказа (выручка), Р - Расходы, Р - Налог
];

export const course = 0.0368; // курс

export const wildberriesColumns = [
  { header: 'Артикул продавца', key: 'sellerArticle' },
  { header: 'Категория', key: 'category' },
  { header: 'Баркод', key: 'barcode' },
  { header: 'Остатки ФБО', key: 'fboRemains' },
  { header: 'закупочная 1ед товара в BYN', key: 'purchasePriceUnitByn' },
  { header: 'закупочная 1ед товара в RUB', key: 'purchasePriceUnitRub' }, // рассчитывается из цены в белках / курс
  { header: 'цена, BYN', key: 'priceByn' }, // цена реализации * курс валют
  { header: 'Цена с спп BYN', key: 'priceWithSPP_Byn' }, // (цена реализации - (цена реализации * спп)) * курс
  { header: 'Цена с спп RUB', key: 'priceWithSPP_Rub' }, // (цена реализации - (цена реализации * спп))
  { header: 'Спп', key: 'spp' },
  { header: 'цена RUB', key: 'priceRub' },
  { header: 'Цена реализации RUB', key: 'salePriceRub' }, // цена Rub - (цена RUB * скидка наша)
  { header: 'Скидка наша', key: 'ourDiscount' },
  { header: 'ROI', key: 'roi' }, // прибыль RUB / закупочная 1ед товара в RUB
  { header: 'Маржинальность', key: 'margin' }, // прибыль RUB / Цена реализации RUB
  { header: 'Прибыль RUB', key: 'profitRub' }, // (выручка в RUB - закупочная 1ед товара в RUB - упаковка BYN / курс) - Налог 20%, рос руб - (Ведение 7%, BYN / курс) - Доставка до WB, RUB - Хранение за 30 дней - Приемка
  { header: 'Прибыль BYN', key: 'profitByn' }, // прибыль RUB * курс
  { header: 'Налог 20%, рос руб', key: 'tax20RosRub' }, // (выручка в рос руб - Упаковка, BYN - закупочная 1ед товара в RUB) * 0.2
  { header: 'Налог 20%, BYN', key: 'tax20Byn' }, // Налог 20%, рос руб * курс
  { header: 'Длина, см', key: 'length' },
  { header: 'Ширина, см', key: 'width' },
  { header: 'Высота, см', key: 'height' },
  { header: 'Объем л', key: 'volumeL' }, // (Д * Ш * В) / 1000
  { header: 'Логистика до покупателя RUB', key: 'logisticsToCustomerRub' }, // if (объем <= 1) {38 * Коэф. склада логистика} else {38 * Коэф. склада логистика + Объем л * (9.5 * Коэф. склада логистика) - (9.5 * Коэф. склада логистика)}
  { header: 'Коэф. склада логистика', key: 'logisticWarehouseCoef' }, // 125%
  { header: 'Коэф. склада хранение', key: 'storageWarehouseCoef' }, // 135%
  { header: 'комиссия вб, %', key: 'wildberriesCommissionPercent' }, // 19.5%
  { header: 'комиссия вб RUB', key: 'wildberriesCommissionRub' }, // комиссия вб, % * Цена реализации RUB
  { header: 'Эквайринг 2% RUB', key: 'acquiring2PercentRub' }, // Цена реализации RUB * 0.02
  { header: 'Упаковка, BYN', key: 'packagingByn' }, // 1
  { header: 'Ведение BYN', key: 'management7PercentByn' }, // (выручка в рос руб * 0.07) * курс
  { header: 'Приемка', key: 'fbsReception' }, // 0
  { header: 'Доставка до WB, RUB', key: 'deliveryToWBRub' }, // if (Остатки ФБО > 0) {14} else {0}
  { header: 'Хранение', key: 'storage' }, // if (Остатки ФБО > 0) {if (Объем л <= 1) {0.07 * Коэф. склада хранение} else {0.07 * Коэф. склада хранение + Объем л * (0.07 * Коэф. склада хранение) - (0.07 * Коэф. склада хранение)} else 0}
  { header: 'Хранение за 30 дней', key: 'storage30Days' }, //  Хранение * 30
  { header: 'выручка в рос руб', key: 'revenueRosRub' }, // Цена реализации RUB - Логистика до покупателя RUB - комиссия вб RUB - Эквайринг 2% RUB
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
  selectedProduct: any = null;
  sellers: Seller[] = [];
  accountDropdownOpen = false; 

  ozonColumns = ozonColumns;

  wildberriesColumns = wildberriesColumns;

  // Форма фильтров
  filtersForm = new FormGroup({
    marketplace: new FormControl('OZON', Validators.required),
    seller: new FormControl<Seller | null>(null, Validators.required),
  });

  productForm: FormGroup = new FormGroup({
    marketplace: new FormControl('OZON', Validators.required),
  });

  constructor(
    public router: Router,
    private http: HttpClient,
    public dialog: MatDialog,
    private loginService: LoginService,
    private productService: ProductService,
    private sellerService: SellerService,
    private reportService: ReportService,
  ) {}

  toggleDropdown() {  
    this.accountDropdownOpen = !this.accountDropdownOpen;  
  }  

  selectProduct(prod: any): void {
    if (prod === this.selectedProduct) {
      this.selectedProduct = null;
    } else {
      this.selectedProduct = prod;
    }
  }

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
        console.log(products);
        this.products = products;
      },
      error: (err) => {
        console.error('Ошибка загрузки товаров', err);
      },
    });
  }

  loadSellers() {
    this.sellerService.getAllSellers().subscribe(
      (data) => {
        this.sellers = data;
        if (this.sellers && this.sellers.length > 0) {
          this.filtersForm.patchValue({
            seller: this.sellers[0],
          });
        }
      },
      (error) => {
        console.error(error);
      }
    );
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
        seller: this.filtersForm.value.seller,
        product: this.selectedProduct,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.selectedProduct = null;
      if (result) {
        const { marketplace, seller, ...details } = result;
        const productPayload = { marketplace, seller, details };
        console.log('productPayload', productPayload);

        this.productService.addProduct(productPayload).subscribe({
          next: (newProduct: any) => {
            console.log('Добавлен товар:', newProduct);
            this.loadProducts();
          },
          error: (err) => {
            this.loadProducts();
            console.error('Ошибка добавления товара', err);
          },
        });
      } else {
        this.loadProducts();
      }
    });
  }

  openAddSellerDialog(): void {
    const dialogRef = this.dialog.open(AddSellerDialogComponent, {
      width: '40%',
      panelClass: 'custom-dialog-container',
      data: {},
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

  deleteProduct() {
    console.log(this.selectedProduct);
    this.productService.deleteProduct(this.selectedProduct.id).subscribe({
      next: (newProduct: any) => {
        console.log('Удален товар:', newProduct);
        this.loadProducts();
      },
      error: (err) => {
        console.error('Ошибка удаления товара', err);
      },
    });
    this.selectedProduct = null;
  }

  logoutUser(){
    this.loginService.logout().subscribe((res)=> {
      this.router.navigate(['login']);
    })
  }

  createReport(){
    this.reportService.createReport(this.products);
  }
}

