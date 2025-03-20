import { Injectable } from '@angular/core';  
import { Chart, ChartConfiguration, registerables } from 'chart.js';  
import { jsPDF } from 'jspdf';  
import roboto from 'roboto-base64';  

Chart.register(...registerables);  

@Injectable({  
  providedIn: 'root',  
})  
export class ReportService {  
  constructor() {}  

  createReport(products: any[]) {  
    /**  
     * 1. Гистограммы "Прибыль по товарам" (разбивка по маркетплейсам)  
     *  
     * Для Wildberries используется поле details.profitByn,  
     * для OZON – details.netProfit.  
     */  
    const wbLabels: string[] = [];  
    const wbProfits: number[] = [];  
    const ozonLabels: string[] = [];  
    const ozonProfits: number[] = [];  

    products.forEach((product) => {  
      // Определяем метку для оси X (артикул или id)  
      const label = product.details.sellerArticle ? String(product.details.sellerArticle) : String(product.id);  
      if (product.marketplace === 'Wildberries') {  
        if (product.details.profitByn) {  
          const profit = parseFloat(product.details.profitByn);  
          if (!isNaN(profit)) {  
            wbLabels.push(label);  
            wbProfits.push(profit);  
          }  
        }  
      } else if (product.marketplace === 'OZON') {  
        if (product.details.netProfit) {  
          const profit = parseFloat(product.details.netProfit);  
          if (!isNaN(profit)) {  
            ozonLabels.push(label);  
            ozonProfits.push(profit);  
          }  
        }  
      }  
    });  

    // Создаём canvas для гистограммы "Прибыль (Wildberries)"  
    const canvasWb = document.createElement('canvas');  
    canvasWb.width = 500;  
    canvasWb.height = 400;  
    document.body.appendChild(canvasWb);  
    const ctxWb = canvasWb.getContext('2d')!;  
    const chartConfigWb: ChartConfiguration = {  
      type: 'bar',  
      data: {  
        labels: wbLabels,  
        datasets: [  
          {  
            label: 'Прибыль (Wildberries)',  
            data: wbProfits,  
            backgroundColor: '#36A2EB',  
          },  
        ],  
      },  
      options: {  
        responsive: false,  
        scales: {  
          x: {  
            title: { display: true, text: 'Товар (артикул/id)' },  
          },  
          y: {  
            title: { display: true, text: 'Прибыль' },  
          },  
        },  
      },  
    };  
    // @ts-ignore  
    new Chart(ctxWb, chartConfigWb);  

    // Создаём canvas для гистограммы "Прибыль (OZON)"  
    const canvasOzon = document.createElement('canvas');  
    canvasOzon.width = 500;  
    canvasOzon.height = 400;  
    document.body.appendChild(canvasOzon);  
    const ctxOzon = canvasOzon.getContext('2d')!;  
    const chartConfigOzon: ChartConfiguration = {  
      type: 'bar',  
      data: {  
        labels: ozonLabels,  
        datasets: [  
          {  
            label: 'Прибыль (OZON)',  
            data: ozonProfits,  
            backgroundColor: '#FF6384',  
          },  
        ],  
      },  
      options: {  
        responsive: false,  
        scales: {  
          x: {  
            title: { display: true, text: 'Товар (артикул/id)' },  
          },  
          y: {  
            title: { display: true, text: 'Прибыль' },  
          },  
        },  
      },  
    };  
    // @ts-ignore  
    new Chart(ctxOzon, chartConfigOzon);  

    /**  
     * 2. Единая гистограмма "Unit-экономика по маркетплейсам" для всех товаров  
     * Для каждого товара собираются три метрики:  
     *  - Цена: для Wildberries (salePriceRub или salePrice), для OZON (salePrice);  
     *  - Маржинальность: для Wildberries (margin), для OZON (marginPercent);  
     *  - Прибыль: для Wildberries (profitByn), для OZON (netProfit).  
     */  
    const productLabels: string[] = [];  
    const prices: number[] = [];  
    const margins: number[] = [];  
    const profits: number[] = [];  

    products.forEach((product) => {  
      const label = product.details.sellerArticle ? String(product.details.sellerArticle) : String(product.id);  
      productLabels.push(label);  
      
      let price: number | null = null;  
      let margin: number | null = null;  
      let profit: number | null = null;  

      if (product.marketplace === 'Wildberries') {  
        if (product.details.salePriceRub) {  
          price = parseFloat(product.details.salePriceRub);  
        } else if (product.details.salePrice) {  
          price = parseFloat(product.details.salePrice);  
        }  
        if (product.details.margin) {  
          margin = parseFloat(product.details.margin);  
        }  
        if (product.details.profitByn) {  
          profit = parseFloat(product.details.profitByn);  
        }  
      } else if (product.marketplace === 'OZON') {  
        if (product.details.salePrice) {  
          price = parseFloat(product.details.salePrice);  
        }  
        if (product.details.marginPercent) {  
          margin = parseFloat(product.details.marginPercent);  
        }  
        if (product.details.netProfit) {  
          profit = parseFloat(product.details.netProfit);  
        }  
      }  
      
      prices.push(price !== null && !isNaN(price) ? price : 0);  
      margins.push(margin !== null && !isNaN(margin) ? margin : 0);  
      profits.push(profit !== null && !isNaN(profit) ? profit : 0);  
    });  

    // Создаём canvas для гистограммы "Unit-экономика по маркетплейсам"  
    const canvasUnit = document.createElement('canvas');  
    canvasUnit.width = 800;  
    canvasUnit.height = 400;  
    document.body.appendChild(canvasUnit);  
    const ctxUnit = canvasUnit.getContext('2d')!;  

    const chartConfigUnit: ChartConfiguration = {  
      type: 'bar',  
      data: {  
        labels: productLabels,  
        datasets: [  
          {  
            label: 'Цена',  
            data: prices,  
            backgroundColor: '#FF6384',  
          },  
          {  
            label: 'Маржинальность',  
            data: margins,  
            backgroundColor: '#4BC0C0',  
          },  
          {  
            label: 'Прибыль',  
            data: profits,  
            backgroundColor: '#FFCE56',  
          },  
        ],  
      },  
      options: {  
        responsive: false,  
        scales: {  
          x: {  
            stacked: false,  
            title: { display: true, text: 'Товары (артикул/id)' },  
          },  
          y: {  
            stacked: false,  
            title: { display: true, text: 'Значение метрики' },  
          },  
        },  
      },  
    };  
    // @ts-ignore  
    new Chart(ctxUnit, chartConfigUnit);  

    /**  
     * 3. Круговая диаграмма "Общая прибыль по маркетплейсам"  
     * Суммируем прибыль:  
     * - Для Wildberries берём сумму по profitByn  
     * - Для OZON берём сумму по netProfit  
     */  
    const overallProfit: { [marketplace: string]: number } = {};  

    products.forEach((product) => {  
      const marketplace: string = product.marketplace;  
      let profit: number | null = null;  
      if (marketplace === 'Wildberries') {  
        if (product.details.profitByn) {  
          profit = parseFloat(product.details.profitByn);  
        }  
      } else if (marketplace === 'OZON') {  
        if (product.details.netProfit) {  
          profit = parseFloat(product.details.netProfit);  
        }  
      }  
      if (profit !== null && !isNaN(profit)) {  
        overallProfit[marketplace] = (overallProfit[marketplace] || 0) + profit;  
      }  
    });  

    const canvasPie = document.createElement('canvas');  
    canvasPie.width = 500;  
    canvasPie.height = 400;  
    document.body.appendChild(canvasPie);  
    const ctxPie = canvasPie.getContext('2d')!;  
    const chartConfigPie: ChartConfiguration = {  
      type: 'pie',  
      data: {  
        labels: Object.keys(overallProfit),  
        datasets: [  
          {  
            label: 'Общая прибыль',  
            data: Object.values(overallProfit).map((val) => parseFloat(val.toFixed(2))),  
            backgroundColor: ['#36A2EB', '#FF6384'],  
          },  
        ],  
      },  
      options: {   
        responsive: false,  
        animation: { duration: 500 },  
      },  
    };  
    // @ts-ignore  
    new Chart(ctxPie, chartConfigPie);  

    /**  
     * Составляем текстовое заключение для PDF  
     */  
    let conclusion = 'Отчет по товарам:\n';  
    conclusion += '1. Гистограммы "Прибыль по товарам":\n';  
    conclusion += `   - Wildberries: ${wbLabels.length} товаров\n`;  
    conclusion += `   - OZON: ${ozonLabels.length} товаров\n\n`;  
    conclusion += '2. Единая гистограмма "Unit-экономика по маркетплейсам" отображает для каждого товара:\n';  
    conclusion += '   Цена, Маржинальность и Прибыль\n\n';  
    conclusion += '3. Круговая диаграмма отражает общую прибыль по маркетплейсам:\n';  
    for (const [mk, profit] of Object.entries(overallProfit)) {  
      conclusion += `   ${mk}: ${profit.toFixed(2)}\n`;  
    }  

    /**  
     * Генерация итогового PDF-документа.  
     * На первой странице располагаются две гистограммы "Прибыль по товарам",  
     * на второй – гистограмма "Unit-экономика по маркетплейсам",  
     * на третьей – круговая диаграмма и заключение, а затем (опционально) детальный перечень товаров.  
     */  
    setTimeout(() => {  
      // Извлекаем изображения из canvas-элементов  
      const wbImage = canvasWb.toDataURL('image/png');  
      const ozonImage = canvasOzon.toDataURL('image/png');  
      const unitImage = canvasUnit.toDataURL('image/png');  
      const pieImage = canvasPie.toDataURL('image/png');  
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });  
      
      // Регистрируем шрифт Roboto  
      pdf.addFileToVFS('Roboto-Regular.ttf', roboto.normal);  
      pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');  
      pdf.setFont('Roboto');  

      // Страница 1: Гистограммы "Прибыль по товарам"  
      pdf.setFontSize(18);  
      pdf.text('Отчет по прибыли и unit-экономике', 10, 20);  
      pdf.setFontSize(14);  
      pdf.text('1. Гистограмма "Прибыль по товарам" (Wildberries)', 10, 30);  
      pdf.addImage(wbImage, 'PNG', 10, 35, 190, 80);  
      pdf.text('Прибыль по товарам (OZON)', 10, 120);  
      pdf.addImage(ozonImage, 'PNG', 10, 125, 190, 80);  

      // Страница 2: Гистограмма "Unit-экономика по маркетплейсам"  
      pdf.addPage();  
      pdf.setFontSize(14);  
      pdf.text('2. Единая гистограмма "Unit-экономика по маркетплейсам"', 10, 20);  
      pdf.addImage(unitImage, 'PNG', 10, 25, 190, 80);  

      // Страница 3: Круговая диаграмма и заключение  
      pdf.addPage();  
      pdf.setFontSize(14);  
      pdf.text('3. Круговая диаграмма "Общая прибыль по маркетплейсам"', 10, 20);  
      pdf.addImage(pieImage, 'PNG', 10, 25, 190, 80);  
      pdf.setFontSize(12);  
      pdf.text('Заключение:', 10, 120);  
      const lines = pdf.splitTextToSize(conclusion, 190);  
      pdf.text(lines, 10, 130);  

      // (Опционально) Добавление детального перечня товаров  
      pdf.addPage();  
      pdf.text('Детальный перечень товаров:', 10, 20);  
      let curY = 30;  
      products.forEach((product) => {  
        let profitStr = '';  
        if (product.marketplace === 'Wildberries') {  
          profitStr = product.details.profitByn ? product.details.profitByn.toString() : 'нет данных';  
        } else if (product.marketplace === 'OZON') {  
          profitStr = product.details.netProfit ? product.details.netProfit.toString() : 'нет данных';  
        }  
        pdf.text(`${product.marketplace} / ${product.details.sellerArticle || product.id} : Прибыль - ${profitStr}`, 10, curY);  
        curY += 7;  
        if (curY > 280) {  
          pdf.addPage();  
          curY = 20;  
        }  
      });  

      pdf.save('report.pdf');  

      // Удаляем временные canvas-элементы из DOM  
      document.body.removeChild(canvasWb);  
      document.body.removeChild(canvasOzon);  
      document.body.removeChild(canvasUnit);  
      document.body.removeChild(canvasPie);  
    }, 1000);  
  }  
}