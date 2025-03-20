import { Injectable } from '@angular/core';
import { course } from '../components/main/main.component';

@Injectable({
  providedIn: 'root'
})
export class EconomicCalculationService {

  constructor() { }

  calculateOzonFields(salePrice: number, volume: number, ozonCommissionPercent: number, costRub: number): any {
    // 1. Комиссия OZON, Р  
    const ozonCommissionRub = salePrice * (ozonCommissionPercent / 100);  
    // 2. Логистика OZON, Р  
    const ozonLogisticsRub = volume <= 1 ? 76 : (76 + (volume - 1) * 12);  
    // 3. Приемка ФБС = 30  
    const fbsReception = 30;  
    // 4. Упаковка = 27.18  
    const packaging = 27.32;  
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
    // 10. Заказы (константа = 1)  
    const orders = 1;  
    // 11. Сумма заказа (выручка)  
    const orderSumRevenue = salePrice * orders;  
    // 12. Расходы  
    const expenses = (ozonCommissionRub + ozonLogisticsRub + fbsReception + costRub + packaging + acquiringPercent + lastMile + managementService7) * orders;  
    // 13. Налог  
    const tax = salePrice / 6;  
    // 14. Чистая прибыль  
    let netProfit = orderSumRevenue - expenses - tax;  
    if (netProfit < 0){
      netProfit = orderSumRevenue - expenses;
    }
    // 15. Маржа, %  
    const marginPercent = costRub !== 0 ? (netProfit / costRub) * 100 : 0;  

    return {ozonCommissionRub, ozonLogisticsRub, fbsReception, packaging, acquiringPercent, lastMile, revenue, managementService7, grossProfitPerUnit, orders, orderSumRevenue, expenses, tax, netProfit, marginPercent}
  } 

  // Вычисления для Wildberries  
  calculateWildberriesFields(priceRubInput: number, ourDiscount: number, spp: number, purchasePriceUnitByn: number, length: number, width: number, height: number, fboRemains: number): any {
    // Константы  
    const logisticWarehouseCoef = 1.25;  
    const storageWarehouseCoef = 1.35;  
    const wildberriesCommissionPercent = 19.5; 

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
    const profitRub = (revenueRosRub - purchasePriceUnitRub - (packagingByn / course)) - tax20RosRub - (management7PercentByn / course) - deliveryToWBRub - storage30Days - 0;  
    // 19. Прибыль BYN = profitRub * course  
    const profitByn = profitRub * course;  
    // 20. ROI = (profitRub / purchasePriceUnitRub) * 100 (если purchasePriceUnitRub != 0)  
    const roi = purchasePriceUnitRub !== 0 ? (profitRub / purchasePriceUnitRub) * 100 : 0;  
    // 21. Маржинальность = profitRub / salePriceRub * 100  
    const margin = salePriceRub !== 0 ? (profitRub / salePriceRub) * 100 : 0;  
  
    return {logisticWarehouseCoef, storageWarehouseCoef, wildberriesCommissionPercent, purchasePriceUnitRub, salePriceRub, priceByn, priceWithSPP_Rub, priceWithSPP_Byn, volumeL, logisticsToCustomerRub, wildberriesCommissionRub, acquiring2PercentRub, packagingByn, revenueRosRub, tax20RosRub, tax20Byn, management7PercentByn, deliveryToWBRub, storage, storage30Days, profitRub, profitByn, roi, margin}
  }

}
