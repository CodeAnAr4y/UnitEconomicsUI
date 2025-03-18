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
import { course } from '../../components/main/main.component'; // курс валют  

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
  ],  
  templateUrl: './add-product-dialog.component.html',  
  styleUrls: ['./add-product-dialog.component.scss']  
})  
export class AddProductDialogComponent implements OnInit {  
  productForm: FormGroup;  
  seller: Seller;  

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
    { key: 'ozonCommissionRub', header: 'Комиссия OZON, Р' },          // salePrice * (ozonCommissionPercent/100)  
    { key: 'ozonLogisticsRub', header: 'Логистика OZON, Р' },            // volume<=1 ? 76 : 76 + (volume - 1)*12  
    { key: 'fbsReception', header: 'Приемка ФБС' },                     // 30  
    { key: 'packaging', header: 'Упаковка' },                            // 27.18  
    { key: 'acquiringPercent', header: 'Эквайринг 1,5%' },              // salePrice * 0.015  
    { key: 'lastMile', header: 'Последняя миля' },                        // if( salePrice*0.055 <20 then 20, if >500 then 500, else salePrice*0.055)  
    { key: 'managementService7', header: 'Услуга ведения 7%' },           // revenue * 0.07  
    { key: 'revenue', header: 'Выручка' },                               // salePrice - (ozonLogisticsRub + acquiringPercent + lastMile + ozonCommissionRub)  
    { key: 'grossProfitPerUnit', header: 'Вал. приб/шт, Р' },            // salePrice - (ozonCommissionRub + ozonLogisticsRub + fbsReception + costRub + packaging + acquiringPercent + lastMile + managementService7)  
    { key: 'marginPercent', header: 'Маржа, %' },                        // grossProfitPerUnit / costRub * 100  
    { key: 'orders', header: 'Заказы, шт (продажи)' },                   // 1  
    { key: 'orderSumRevenue', header: 'Сумма заказа (выручка), Р' },      // salePrice * orders  
    { key: 'expenses', header: 'Расходы, Р' },                           // (ozonCommissionRub+ozonLogisticsRub+fbsReception+costRub+packaging+acquiringPercent+lastMile+managementService7)*orders  
    { key: 'tax', header: 'Налог' },                                     // salePrice/6  
    { key: 'netProfit', header: 'Чист. прибл., Р' },                      // orderSumRevenue - expenses - tax  
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
    { key: 'purchasePriceUnitRub', header: 'закупочная 1ед товара в RUB' }, // purchasePriceUnitByn / course  
    { key: 'salePriceRub', header: 'Цена реализации RUB' },                  // priceRub - (priceRub * ourDiscount)  
    { key: 'priceByn', header: 'цена, BYN' },                                 // salePriceRub * course  
    { key: 'priceWithSPP_Rub', header: 'Цена с спп RUB' },                     // salePriceRub - (salePriceRub * spp)  
    { key: 'priceWithSPP_Byn', header: 'Цена с спп BYN' },                     // priceWithSPP_Rub * course  
    { key: 'roi', header: 'ROI' },                                            // profitRub / purchasePriceUnitRub * 100  
    { key: 'margin', header: 'Маржинальность' },                              // profitRub / salePriceRub * 100  
    { key: 'tax20RosRub', header: 'Налог 20%, рос руб' },                     // (revenueRosRub - packagingByn - purchasePriceUnitRub) * 0.2  
    { key: 'tax20Byn', header: 'Налог 20%, BYN' },                            // tax20RosRub * course  
    { key: 'volumeL', header: 'Объем л' },                                    // (length*width*height)/1000  
    { key: 'logisticsToCustomerRub', header: 'Логистика до покупателя RUB' },   // if(volumeL<=1) {38*logisticWarehouseCoef} else {38*logisticWarehouseCoef + volumeL*(9.5*logisticWarehouseCoef) - (9.5*logisticWarehouseCoef)}  
    { key: 'logisticWarehouseCoef', header: 'Коэф. склада логистика' },       // 1.25  
    { key: 'storageWarehouseCoef', header: 'Коэф. склада хранение' },          // 1.35  
    { key: 'wildberriesCommissionRub', header: 'комиссия вб RUB' },           // salePriceRub * (wildberriesCommissionPercent/100)  
    { key: 'acquiring2PercentRub', header: 'Эквайринг 2% RUB' },              // salePriceRub * 0.02  
    { key: 'packagingByn', header: 'Упаковка, BYN' },                         // 1  
    { key: 'management7PercentByn', header: 'Ведение BYN' },                  // revenueRosRub * 0.07 * course  
    { key: 'fbsReception', header: 'Приемка' },                              // 0  
    { key: 'deliveryToWBRub', header: 'Доставка до WB, RUB' },                // fboRemains > 0 ? 14 : 0  
    { key: 'storage', header: 'Хранение' },                                  // если fboRemains > 0: volumeL<=1 ? 0.07*storageWarehouseCoef : (0.07*storageWarehouseCoef + volumeL*(0.07*storageWarehouseCoef) - (0.07*storageWarehouseCoef)); иначе 0  
    { key: 'storage30Days', header: 'Хранение за 30 дней' },                  // storage * 30  
    { key: 'revenueRosRub', header: 'выручка в рос руб' },                    // salePriceRub - logisticsToCustomerRub - wildberriesCommissionRub - acquiring2PercentRub  
    { key: 'profitRub', header: 'Прибыль RUB' },                              // (revenueRosRub - purchasePriceUnitRub - (packagingByn / course)) - tax20RosRub - (management7PercentByn / course) - deliveryToWBRub - storage30Days - fbsReception  
    { key: 'profitByn', header: 'Прибыль BYN' }                               // profitRub * course  
  ];  

  constructor(  
    public dialogRef: MatDialogRef<AddProductDialogComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: any,  
    private fb: FormBuilder  
  ) {  
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
      // Если уже существует (например, sellerArticle), не пересоздаём  
      if (!this.productForm.contains(field.key)) {  
        this.productForm.addControl(field.key, this.fb.control('', Validators.required));  
      }  
    });  
    // Добавляем контролы для вычисляемых полей Wildberries (readOnly)  
    this.wildberriesComputedFields.forEach(field => {  
      this.productForm.addControl(field.key, this.fb.control({ value: '', disabled: true }));  
    });  

    // Устанавливаем валидаторы для выбранного маркетплейса  
    this.setValidators(this.productForm.get('marketplace')?.value);  

    // При переключении площадки обновляем валидаторы  
    this.productForm.get('marketplace')?.valueChanges.subscribe((value: string) => {  
      this.setValidators(value);  
    });  

    // Подписываемся на изменения формы для мгновенного пересчёта вычисляемых полей  
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
    // Для OZON: контролы ручного ввода активны, а для Wildberries – валидаторы снимаем  
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

  // Вычисления для OZON  
  private calculateOzonFields(): void {  
    console.log("start changing");
    // Читаем необходимые поля (все числовые значения)  
    const salePrice = parseFloat(this.getValue('salePrice'));  
    const volume = parseFloat(this.getValue('volume'));  
    const ozonCommissionPercent = parseFloat(this.getValue('ozonCommissionPercent'));  
    const costRub = parseFloat(this.getValue('costRub'));  
    
    if (isNaN(salePrice) || isNaN(volume) || isNaN(ozonCommissionPercent) || isNaN(costRub)) {  
      return;  
    }  
    
    // 1. Комиссия OZON, Р  
    const ozonCommissionRub = salePrice * (ozonCommissionPercent / 100);  
    // 2. Логистика OZON, Р  
    const ozonLogisticsRub = volume <= 1 ? 76 : (76 + (volume - 1) * 12);  
    // 3. Приемка ФБС = 30  
    const fbsReception = 30;  
    // 4. Упаковка = 27.18  
    const packaging = 27.18;  
    // 5. Эквайринг 1,5%  
    const acquiringPercent = salePrice * 0.015;  
    // 6. Последняя миля  
    let lastMile = salePrice * 0.055;  
    if (lastMile < 20) { lastMile = 20; }  
    if (lastMile > 500) { lastMile = 500; }  
    // 7. Выручка  
    const revenue = salePrice - (ozonLogisticsRub + acquiringPercent + lastMile + ozonCommissionRub);  
    // 8. Услуга ведения 7%  
    const managementService7 = revenue * 0.07;  
    // 9. Валовая прибыль за единицу  
    const grossProfitPerUnit = salePrice - (ozonCommissionRub + ozonLogisticsRub + fbsReception + costRub + packaging + acquiringPercent + lastMile + managementService7);  
    // 10. Маржа, %  
    const marginPercent = costRub !== 0 ? (grossProfitPerUnit / costRub) * 100 : 0;  
    // 11. Заказы (константа = 1)  
    const orders = 1;  
    // 12. Сумма заказа (выручка)  
    const orderSumRevenue = salePrice * orders;  
    // 13. Расходы  
    const expenses = (ozonCommissionRub + ozonLogisticsRub + fbsReception + costRub + packaging + acquiringPercent + lastMile + managementService7) * orders;  
    // 14. Налог  
    const tax = salePrice / 6;  
    // 15. Чистая прибыль  
    const netProfit = orderSumRevenue - expenses - tax;  

    // Обновляем контролы с вычисленными значениями  
    this.productForm.patchValue({  
      ozonCommissionRub: ozonCommissionRub.toFixed(2),  
      ozonLogisticsRub: ozonLogisticsRub.toFixed(2),  
      fbsReception: fbsReception,  
      packaging: packaging,  
      acquiringPercent: acquiringPercent.toFixed(2),  
      lastMile: lastMile.toFixed(2),  
      revenue: revenue.toFixed(2),  
      managementService7: managementService7.toFixed(2),  
      grossProfitPerUnit: grossProfitPerUnit.toFixed(2),  
      marginPercent: marginPercent.toFixed(2),  
      orders: orders,  
      orderSumRevenue: orderSumRevenue.toFixed(2),  
      expenses: expenses.toFixed(2),  
      tax: tax.toFixed(2),  
      netProfit: netProfit.toFixed(2)  
    }, { emitEvent: false });  

    console.log("Values patched", this.productForm.value);
  }  

  // Вычисления для Wildberries  
  private calculateWildberriesFields(): void {  
    console.log("start changing");
    // Читаем необходимые поля  
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

    // Константы  
    const logisticWarehouseCoef = 1.25;  
    const storageWarehouseCoef = 1.35;  
    const wildberriesCommissionPercent = 19.5; // по условиям  

    // 1. закупочная 1ед товара в RUB  
    const purchasePriceUnitRub = purchasePriceUnitByn / course;  
    // 2. Цена реализации RUB = priceRub - (priceRub * ourDiscount)  
    const salePriceRub = priceRubInput - (priceRubInput * ourDiscount);  
    // 3. цена, BYN = salePriceRub * course  
    const priceByn = salePriceRub * course;  
    // 4. Цена с спп RUB = salePriceRub - (salePriceRub * spp)  
    const priceWithSPP_Rub = salePriceRub - (salePriceRub * spp);  
    // 5. Цена с спп BYN = priceWithSPP_Rub * course  
    const priceWithSPP_Byn = priceWithSPP_Rub * course;  
    // 6. Объем л = (Длина*Ширина*Высота)/1000  
    const volumeL = (length * width * height) / 1000;  
    // 7. Логистика до покупателя RUB  
    let logisticsToCustomerRub = 38 * logisticWarehouseCoef;  
    if (volumeL > 1) {  
      logisticsToCustomerRub = 38 * logisticWarehouseCoef + volumeL * (9.5 * logisticWarehouseCoef) - (9.5 * logisticWarehouseCoef);  
    }  
    // 8. комиссия вб RUB = salePriceRub * (wildberriesCommissionPercent/100)  
    const wildberriesCommissionRub = salePriceRub * (wildberriesCommissionPercent / 100);  
    // 9. Эквайринг 2% RUB = salePriceRub * 0.02  
    const acquiring2PercentRub = salePriceRub * 0.02;  
    // 10. Упаковка, BYN = 1  
    const packagingByn = 1;  
    // 11. Для расчёта revenueRosRub сначала вычислим:  
    // revenueRosRub = salePriceRub - logisticsToCustomerRub - wildberriesCommissionRub - acquiring2PercentRub  
    const revenueRosRub = salePriceRub - logisticsToCustomerRub - wildberriesCommissionRub - acquiring2PercentRub;  
    // 12. Налог 20%, рос руб = (revenueRosRub - packagingByn - purchasePriceUnitRub) * 0.2  
    const tax20RosRub = (revenueRosRub - packagingByn - purchasePriceUnitRub) * 0.2;  
    // 13. Налог 20%, BYN = tax20RosRub * course  
    const tax20Byn = tax20RosRub * course;  
    // 14. Ведение BYN = revenueRosRub * 0.07 * course  
    const management7PercentByn = revenueRosRub * 0.07 * course;  
    // 15. Доставка до WB, RUB = fboRemains > 0 ? 14 : 0  
    const deliveryToWBRub = fboRemains > 0 ? 14 : 0;  
    // 16. Хранение: если fboRemains > 0  
    let storage = 0;  
    if (fboRemains > 0) {  
      if (volumeL <= 1) {  
        storage = 0.07 * storageWarehouseCoef;  
      } else {  
        storage = 0.07 * storageWarehouseCoef + volumeL * (0.07 * storageWarehouseCoef) - (0.07 * storageWarehouseCoef);  
      }  
    }  
    // 17. Хранение за 30 дней = storage * 30  
    const storage30Days = storage * 30;  
    // 18. Прибыль RUB:  
    // profitRub = (revenueRosRub - purchasePriceUnitRub - (packagingByn / course)) - tax20RosRub - (management7PercentByn / course) - deliveryToWBRub - storage30Days - fbsReception  
    // fbsReception для Wildberries = 0  
    const profitRub = (revenueRosRub - purchasePriceUnitRub - (packagingByn / course)) - tax20RosRub - (management7PercentByn / course) - deliveryToWBRub - storage30Days - 0;  
    // 19. Прибыль BYN = profitRub * course  
    const profitByn = profitRub * course;  
    // 20. ROI = (profitRub / purchasePriceUnitRub) * 100 (если purchasePriceUnitRub != 0)  
    const roi = purchasePriceUnitRub !== 0 ? (profitRub / purchasePriceUnitRub) * 100 : 0;  
    // 21. Маржинальность = profitRub / salePriceRub * 100  
    const margin = salePriceRub !== 0 ? (profitRub / salePriceRub) * 100 : 0;  

    // Обновляем контролы с вычисленными значениями  
    this.productForm.patchValue({  
      purchasePriceUnitRub: purchasePriceUnitRub.toFixed(2),  
      salePriceRub: salePriceRub.toFixed(2),  
      priceByn: priceByn.toFixed(2),  
      priceWithSPP_Rub: priceWithSPP_Rub.toFixed(2),  
      priceWithSPP_Byn: priceWithSPP_Byn.toFixed(2),  
      roi: roi.toFixed(2),  
      margin: margin.toFixed(2),  
      tax20RosRub: tax20RosRub.toFixed(2),  
      tax20Byn: tax20Byn.toFixed(2),  
      volumeL: volumeL.toFixed(3),  
      logisticsToCustomerRub: logisticsToCustomerRub.toFixed(2),  
      logisticWarehouseCoef: logisticWarehouseCoef,  
      storageWarehouseCoef: storageWarehouseCoef,  
      wildberriesCommissionRub: wildberriesCommissionRub.toFixed(2),  
      acquiring2PercentRub: acquiring2PercentRub.toFixed(2),  
      packagingByn: packagingByn,  
      management7PercentByn: management7PercentByn.toFixed(2),  
      fbsReception: 0,  
      deliveryToWBRub: deliveryToWBRub,  
      storage: storage.toFixed(2),  
      storage30Days: storage30Days.toFixed(2),  
      revenueRosRub: revenueRosRub.toFixed(2),  
      profitRub: profitRub.toFixed(2),  
      profitByn: profitByn.toFixed(2),  
    }, { emitEvent: false });  
    console.log("Values patched", this.productForm.value);

  }  

  // Утилита для получения значения контрола  
  private getValue(controlName: string): string {  
    const control: AbstractControl | null = this.productForm.get(controlName);  
    return control ? control.value : '';  
  }  

  onSubmit(): void {  
    if (this.productForm.valid) {  
      const marketplace = this.productForm.get('marketplace')?.value;  
      const productData: any = { marketplace };  
      productData.seller = this.seller.id;  
      // Собираем все данные, включая вычисленные поля (используем getRawValue для disabled контролов)  
      const allKeys = Object.keys(this.productForm.controls);  
      allKeys.forEach(key => {  
        productData[key] = this.productForm.getRawValue()[key];  
      });  
      this.dialogRef.close(productData);  
    } else {  
      console.log('Форма невалидна:', this.productForm.value);  
    }  
  }  

  onCancel(): void {  
    this.dialogRef.close();  
  }  
}