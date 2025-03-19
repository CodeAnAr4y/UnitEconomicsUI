import { Component, Inject, OnInit } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import {  
  FormBuilder,  
  FormGroup,  
  Validators,  
  AbstractControl,  
  ReactiveFormsModule  
} from '@angular/forms';  
import {  
  MAT_DIALOG_DATA,  
  MatDialogRef,  
  MatDialogModule  
} from '@angular/material/dialog';  
import { MatButtonModule } from '@angular/material/button';  
import { MatButtonToggleModule } from '@angular/material/button-toggle';  
import { MatInputModule } from '@angular/material/input';  
import { MatSelectModule } from '@angular/material/select';  
import { MatFormFieldModule } from '@angular/material/form-field';  
import { Seller } from '../../services/seller.service';  
import { EconomicCalculationService } from '../../services/economic-calculation.service';  
import { Product, ProductService } from '../../services/product.service';  

// Импорт нового компонента  
import { DragAndDropComponent } from '../drag-and-drop/drag-and-drop.component';  

interface ComputedField {  
  key: string;  
  header: string;  
}  

@Component({  
  selector: 'app-add-product-dialog',  
  standalone: true,  
  imports: [  
    CommonModule,  
    ReactiveFormsModule,  
    MatDialogModule,  
    MatButtonModule,  
    MatButtonToggleModule,  
    MatInputModule,  
    MatSelectModule,  
    MatFormFieldModule,  
    DragAndDropComponent // Подключаем компонент DragAndDrop  
  ],  
  templateUrl: './add-product-dialog.component.html',  
  styleUrls: ['./add-product-dialog.component.scss']  
})  
export class AddProductDialogComponent implements OnInit {  
  productForm: FormGroup;  
  seller: Seller;  
  // Данные, полученные из Excel  
  excelData: any[] = [];  

  // ПОЛЯ РУЧНОГО ВВОДА для OZON  
  ozonManualFields = [  
    { header: 'Артикул продавца', key: 'sellerArticle' },  
    { header: 'Объем', key: 'volume' },  
    { header: 'Статус', key: 'status' },  
    { header: 'Цена реализации', key: 'salePrice' },  
    { header: 'Комиссия OZON, %', key: 'ozonCommissionPercent' },  
    { header: 'Себестоимость BYN', key: 'costByn' },  
    { header: 'Себестоимость в RUB', key: 'costRub' },  
  ];  

  // ПОЛЯ ВЫЧИСЛЯЕМЫЕ для OZON  
  ozonComputedFields: ComputedField[] = [  
    { key: 'ozonCommissionRub', header: 'Комиссия OZON, Р' },  
    { key: 'ozonLogisticsRub', header: 'Логистика OZON, Р' },  
    { key: 'fbsReception', header: 'Приемка ФБС' },  
    { key: 'packaging', header: 'Упаковка' },  
    { key: 'acquiringPercent', header: 'Эквайринг 1,5%' },  
    { key: 'lastMile', header: 'Последняя миля' },  
    { key: 'managementService7', header: 'Услуга ведения 7%' },  
    { key: 'revenue', header: 'Выручка' },  
    { key: 'grossProfitPerUnit', header: 'Вал. приб/шт, Р' },  
    { key: 'marginPercent', header: 'Маржа, %' },  
    { key: 'orders', header: 'Заказы, шт (продажи)' },  
    { key: 'orderSumRevenue', header: 'Сумма заказа (выручка), Р' },  
    { key: 'expenses', header: 'Расходы, Р' },  
    { key: 'tax', header: 'Налог' },  
    { key: 'netProfit', header: 'Чист. прибл., Р' },  
  ];  

  // ПОЛЯ РУЧНОГО ВВОДА для Wildberries  
  wildberriesManualFields = [  
    { header: 'Артикул продавца', key: 'sellerArticle' },  
    { header: 'Категория', key: 'category' },  
    { header: 'Баркод', key: 'barcode' },  
    { header: 'Остатки ФБО', key: 'fboRemains' },  
    { header: 'закупочная 1ед товара в BYN', key: 'purchasePriceUnitByn' },  
    { header: 'Спп', key: 'spp' },  
    { header: 'цена RUB', key: 'priceRub' },  
    { header: 'Скидка наша', key: 'ourDiscount' },  
    { header: 'Длина, см', key: 'length' },  
    { header: 'Ширина, см', key: 'width' },  
    { header: 'Высота, см', key: 'height' },  
  ];  

  // ПОЛЯ ВЫЧИСЛЯЕМЫЕ для Wildberries  
  wildberriesComputedFields: ComputedField[] = [  
    { key: 'purchasePriceUnitRub', header: 'закупочная 1ед товара в RUB' },  
    { key: 'salePriceRub', header: 'Цена реализации RUB' },  
    { key: 'priceByn', header: 'цена, BYN' },  
    { key: 'priceWithSPP_Rub', header: 'Цена с спп RUB' },  
    { key: 'priceWithSPP_Byn', header: 'Цена с спп BYN' },  
    { key: 'roi', header: 'ROI' },  
    { key: 'margin', header: 'Маржинальность' },  
    { key: 'tax20RosRub', header: 'Налог 20%, рос руб' },  
    { key: 'tax20Byn', header: 'Налог 20%, BYN' },  
    { key: 'volumeL', header: 'Объем л' },  
    { key: 'logisticsToCustomerRub', header: 'Логистика до покупателя RUB' },  
    { key: 'logisticWarehouseCoef', header: 'Коэф. склада логистика' },  
    { key: 'storageWarehouseCoef', header: 'Коэф. склада хранение' },  
    { key: 'wildberriesCommissionRub', header: 'комиссия вб RUB' },  
    { key: 'acquiring2PercentRub', header: 'Эквайринг 2% RUB' },  
    { key: 'packagingByn', header: 'Упаковка, BYN' },  
    { key: 'management7PercentByn', header: 'Ведение BYN' },  
    { key: 'fbsReception', header: 'Приемка' },  
    { key: 'deliveryToWBRub', header: 'Доставка до WB, RUB' },  
    { key: 'storage', header: 'Хранение' },  
    { key: 'storage30Days', header: 'Хранение за 30 дней' },  
    { key: 'revenueRosRub', header: 'выручка в рос руб' },  
    { key: 'profitRub', header: 'Прибыль RUB' },  
    { key: 'profitByn', header: 'Прибыль BYN' },  
  ];  

  payload: any = null;

  constructor(  
    public dialogRef: MatDialogRef<AddProductDialogComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: any,  
    private fb: FormBuilder,  
    private economicCalculationService: EconomicCalculationService,  
    private productService: ProductService  
  ) {  
    console.log('data', data);
    this.seller = data.seller;  

    // Изначально выбираем маркетплейс OZON  
    this.productForm = this.fb.group({  
      marketplace: ['OZON', Validators.required],  
    });  

    // Добавляем контролы для ручного ввода OZON  
    this.ozonManualFields.forEach(field => {  
      this.productForm.addControl(field.key, this.fb.control('', Validators.required));  
    });  
    // Добавляем контролы для вычисляемых полей OZON (readOnly)  
    this.ozonComputedFields.forEach(field => {  
      this.productForm.addControl(field.key, this.fb.control({ value: '', disabled: true }));  
    });  

    // Добавляем контролы для ручного ввода Wildberries  
    this.wildberriesManualFields.forEach(field => {  
      if (!this.productForm.contains(field.key)) {  
        this.productForm.addControl(field.key, this.fb.control('', Validators.required));  
      }  
    });  

    // Добавляем контролы для вычисляемых полей Wildberries (readOnly)  
    this.wildberriesComputedFields.forEach(field => {  
      this.productForm.addControl(field.key, this.fb.control({ value: '', disabled: true }));  
    });  

    this.setValidators(this.productForm.get('marketplace')?.value);  

    // При переключении площадки обновляем валидаторы  
    this.productForm.get('marketplace')?.valueChanges.subscribe((value: string) => {  
      this.setValidators(value);  
    });  

      // Если имеются данные выбранного товара, заполняем поля формы  
    if (data.product) {  
      // Заполняем контролы из объекта details  
      for (const key in data.product.details) {  
        if (this.productForm.contains(key)) {  
          this.productForm.get(key)?.setValue(data.product.details[key]);  
        }  
      }  
      const marketplace = this.productForm.get('marketplace')?.value;  
      if (marketplace === 'OZON') {  
        this.calculateOzonFields();  
      } else if (marketplace === 'Wildberries') {  
        this.calculateWildberriesFields();  
      }  
    } 

    // Подписка на изменения формы для пересчёта вычисляемых полей (при ручном вводе)  
    this.productForm.valueChanges.subscribe(() => {  
      const marketplace = this.productForm.get('marketplace')?.value;  
      if (marketplace === 'OZON') {  
        this.calculateOzonFields();  
      } else if (marketplace === 'Wildberries') {  
        this.calculateWildberriesFields();  
      }  
    });  
  }  

  ngOnInit(): void {}  

  private setValidators(marketplace: string): void {  
    // Для OZON  
    this.ozonManualFields.forEach(field => {  
      const control = this.productForm.get(field.key);  
      if (marketplace === 'OZON') {  
        control?.setValidators(Validators.required);  
      } else {  
        control?.clearValidators();  
      }  
      control?.updateValueAndValidity();  
    });  
    // Для Wildberries  
    this.wildberriesManualFields.forEach(field => {  
      const control = this.productForm.get(field.key);  
      if (marketplace === 'Wildberries') {  
        control?.setValidators(Validators.required);  
      } else {  
        control?.clearValidators();  
      }  
      control?.updateValueAndValidity();  
    });  
  }  

  // Пример вычислений для OZON (при ручном вводе) - аналог функций расчёта  
  private calculateOzonFields(): void {  
    const salePrice = parseFloat(this.getValue('salePrice'));  
    const volume = parseFloat(this.getValue('volume'));  
    const ozonCommissionPercent = parseFloat(this.getValue('ozonCommissionPercent'));  
    const costRub = parseFloat(this.getValue('costRub'));  
    if (isNaN(salePrice) || isNaN(volume) || isNaN(ozonCommissionPercent) || isNaN(costRub)) {  
      return;  
    }  
    const calc = this.economicCalculationService.calculateOzonFields(salePrice, volume, ozonCommissionPercent, costRub);  
    this.productForm.patchValue({  
      ozonCommissionRub: calc.ozonCommissionRub.toFixed(2),  
      ozonLogisticsRub: calc.ozonLogisticsRub.toFixed(2),  
      fbsReception: calc.fbsReception,  
      packaging: calc.packaging,  
      acquiringPercent: calc.acquiringPercent.toFixed(2),  
      lastMile: calc.lastMile.toFixed(2),  
      revenue: calc.revenue.toFixed(2),  
      managementService7: calc.managementService7.toFixed(2),  
      grossProfitPerUnit: calc.grossProfitPerUnit.toFixed(2),  
      marginPercent: calc.marginPercent.toFixed(2),  
      orders: calc.orders,  
      orderSumRevenue: calc.orderSumRevenue.toFixed(2),  
      expenses: calc.expenses.toFixed(2),  
      tax: calc.tax.toFixed(2),  
      netProfit: calc.netProfit.toFixed(2)  
    }, { emitEvent: false });  
  }  

  // Пример вычислений для Wildberries (при ручном вводе) - аналог функций расчёта  
  private calculateWildberriesFields(): void {  
    const priceRubInput = parseFloat(this.getValue('priceRub'));  
    const ourDiscount = parseFloat(this.getValue('ourDiscount'));  
    const spp = parseFloat(this.getValue('spp'));  
    const purchasePriceUnitByn = parseFloat(this.getValue('purchasePriceUnitByn'));  
    const length = parseFloat(this.getValue('length'));  
    const width = parseFloat(this.getValue('width'));  
    const height = parseFloat(this.getValue('height'));  
    const fboRemains = parseFloat(this.getValue('fboRemains'));  
    if (  
      isNaN(priceRubInput) ||  
      isNaN(ourDiscount) ||  
      isNaN(spp) ||  
      isNaN(purchasePriceUnitByn) ||  
      isNaN(length) ||  
      isNaN(width) ||  
      isNaN(height) ||  
      isNaN(fboRemains)  
    ) {  
      return;  
    }  
    const calc = this.economicCalculationService.calculateWildberriesFields(  
      priceRubInput, ourDiscount, spp, purchasePriceUnitByn, length, width, height, fboRemains  
    );  
    this.productForm.patchValue({  
      purchasePriceUnitRub: calc.purchasePriceUnitRub.toFixed(2),  
      salePriceRub: calc.salePriceRub.toFixed(2),  
      priceByn: calc.priceByn.toFixed(2),  
      priceWithSPP_Rub: calc.priceWithSPP_Rub.toFixed(2),  
      priceWithSPP_Byn: calc.priceWithSPP_Byn.toFixed(2),  
      roi: calc.roi.toFixed(2),  
      margin: calc.margin.toFixed(2),  
      tax20RosRub: calc.tax20RosRub.toFixed(2),  
      tax20Byn: calc.tax20Byn.toFixed(2),  
      volumeL: calc.volumeL.toFixed(3),  
      logisticsToCustomerRub: calc.logisticsToCustomerRub.toFixed(2),  
      logisticWarehouseCoef: calc.logisticWarehouseCoef,  
      storageWarehouseCoef: calc.storageWarehouseCoef,  
      wildberriesCommissionRub: calc.wildberriesCommissionRub.toFixed(2),  
      acquiring2PercentRub: calc.acquiring2PercentRub.toFixed(2),  
      packagingByn: calc.packagingByn,  
      management7PercentByn: calc.management7PercentByn.toFixed(2),  
      fbsReception: 0,  
      deliveryToWBRub: calc.deliveryToWBRub,  
      storage: calc.storage.toFixed(2),  
      storage30Days: calc.storage30Days.toFixed(2),  
      revenueRosRub: calc.revenueRosRub.toFixed(2),  
      profitRub: calc.profitRub.toFixed(2),  
      profitByn: calc.profitByn.toFixed(2)  
    }, { emitEvent: false });  
  }  

  // Утилита для получения значения контрола  
  private getValue(controlName: string): string {  
    const control: AbstractControl | null = this.productForm.get(controlName);  
    return control ? control.value : '';  
  }  

  // Обработчик события, получаем данные из DragAndDropComponent  
  onFileLoaded(data: any[]): void {  
    // Сохраняем данные, полученные из Excel  
    this.excelData = data;  
  
    this.excelData.forEach(row => {  
      console.log('Обрабатываем строку:', row);  
      const marketplace = this.productForm.get('marketplace')?.value;  
      // Выбираем константы соответствующие маркетплейсу  
      const manualFields = marketplace === 'OZON' ? this.ozonManualFields : this.wildberriesManualFields;  
      let details: any = {};  
  
      // Сопоставляем значения из строки с полями формы  
      manualFields.forEach(field => {  
        details[field.key] = row[field.header] || '';  
      });  
  
      // Вычисляем остальные поля, в зависимости от маркетплейса  
      if (marketplace === 'OZON') {  
        // Извлекаем необходимые значения для расчёта  
        const salePrice = parseFloat(details['salePrice']);  
        const volume = parseFloat(details['volume']);  
        const ozonCommissionPercent = parseFloat(details['ozonCommissionPercent']);  
        const costRub = parseFloat(details['costRub']);  
  
        // Если данные корректны, проводим расчёт  
        if (!isNaN(salePrice) && !isNaN(volume) && !isNaN(ozonCommissionPercent) && !isNaN(costRub)) {  
          const calc = this.economicCalculationService.calculateOzonFields(salePrice, volume, ozonCommissionPercent, costRub);  
  
          // Объединяем вычисленные поля с существующими значениями  
          details = {  
            ...details,  
            ozonCommissionRub: calc.ozonCommissionRub.toFixed(2),  
            ozonLogisticsRub: calc.ozonLogisticsRub.toFixed(2),  
            fbsReception: calc.fbsReception,  
            packaging: calc.packaging,  
            acquiringPercent: calc.acquiringPercent.toFixed(2),  
            lastMile: calc.lastMile.toFixed(2),  
            revenue: calc.revenue.toFixed(2),  
            managementService7: calc.managementService7.toFixed(2),  
            grossProfitPerUnit: calc.grossProfitPerUnit.toFixed(2),  
            marginPercent: calc.marginPercent.toFixed(2),  
            orders: calc.orders,  
            orderSumRevenue: calc.orderSumRevenue.toFixed(2),  
            expenses: calc.expenses.toFixed(2),  
            tax: calc.tax.toFixed(2),  
            netProfit: calc.netProfit.toFixed(2)  
          };  
        }  
      } else if (marketplace === 'Wildberries') {  
        // Извлекаем необходимые значения для расчёта  
        const priceRubInput = parseFloat(details['priceRub']);  
        const ourDiscount = parseFloat(details['ourDiscount']);  
        const spp = parseFloat(details['spp']);  
        const purchasePriceUnitByn = parseFloat(details['purchasePriceUnitByn']);  
        const length = parseFloat(details['length']);  
        const width = parseFloat(details['width']);  
        const height = parseFloat(details['height']);  
        const fboRemains = parseFloat(details['fboRemains']);  
  
        // Если данные корректны, проводим расчёт  
        if (  
          !isNaN(priceRubInput) && !isNaN(ourDiscount) && !isNaN(spp) &&  
          !isNaN(purchasePriceUnitByn) && !isNaN(length) && !isNaN(width) &&  
          !isNaN(height) && !isNaN(fboRemains)  
        ) {  
          const calc = this.economicCalculationService.calculateWildberriesFields(  
            priceRubInput, ourDiscount, spp, purchasePriceUnitByn, length, width, height, fboRemains  
          );  
  
          // Объединяем вычисленные поля с уже полученными данными  
          details = {  
            ...details,  
            purchasePriceUnitRub: calc.purchasePriceUnitRub.toFixed(2),  
            salePriceRub: calc.salePriceRub.toFixed(2),  
            priceByn: calc.priceByn.toFixed(2),  
            priceWithSPP_Rub: calc.priceWithSPP_Rub.toFixed(2),  
            priceWithSPP_Byn: calc.priceWithSPP_Byn.toFixed(2),  
            roi: calc.roi.toFixed(2),  
            margin: calc.margin.toFixed(2),  
            tax20RosRub: calc.tax20RosRub.toFixed(2),  
            tax20Byn: calc.tax20Byn.toFixed(2),  
            volumeL: calc.volumeL.toFixed(3),  
            logisticsToCustomerRub: calc.logisticsToCustomerRub.toFixed(2),  
            logisticWarehouseCoef: calc.logisticWarehouseCoef,  
            storageWarehouseCoef: calc.storageWarehouseCoef,  
            wildberriesCommissionRub: calc.wildberriesCommissionRub.toFixed(2),  
            acquiring2PercentRub: calc.acquiring2PercentRub.toFixed(2),  
            packagingByn: calc.packagingByn,  
            management7PercentByn: calc.management7PercentByn.toFixed(2),  
            fbsReception: 0,  
            deliveryToWBRub: calc.deliveryToWBRub,  
            storage: calc.storage.toFixed(2),  
            storage30Days: calc.storage30Days.toFixed(2),  
            revenueRosRub: calc.revenueRosRub.toFixed(2),  
            profitRub: calc.profitRub.toFixed(2),  
            profitByn: calc.profitByn.toFixed(2)  
          };  
        }  
      }  
  
      // Формируем payload для отправки товара  
      const productPayload = {  
        marketplace: marketplace,  
        seller: this.seller.id,  
        details: details,  
      };  
  
      console.log(productPayload);

      // Отправка товара на сервер  
      this.productService.addProduct(productPayload).subscribe({  
        next: (newProduct: any) => {  
          console.log('Добавлен товар:', newProduct);  
        },  
        error: (err) => {  
          console.error('Ошибка добавления товара', err);  
        },  
      });  
    });  
  
    this.dialogRef.close();  
  } 

  onSubmit(): void {  
    if (this.productForm.valid) {  
      const marketplace = this.productForm.get('marketplace')?.value;  
      const productData: any = { marketplace };  
      productData.seller = this.seller.id;
      const allKeys = Object.keys(this.productForm.controls);  
      allKeys.forEach(key => {  
        productData[key] = this.productForm.getRawValue()[key];  
      });  
      console.log(productData);
      this.data.product.details = productData;
      if (this.data.product){
        this.productService.updateProduct(this.data.product).subscribe({  
          next: (newProduct: any) => {  
            console.log('Добавлен товар:', newProduct);  
            this.dialogRef.close();
          },  
          error: (err) => {  
            this.dialogRef.close();
            console.error('Ошибка добавления товара', err);  
          },  
        })
      } else {
        this.dialogRef.close(productData); 
      } 
    } else {  
      console.log('Форма невалидна:', this.productForm.value);  
    }  
  }   

  onCancel(): void {  
    this.dialogRef.close();  
  }  
}