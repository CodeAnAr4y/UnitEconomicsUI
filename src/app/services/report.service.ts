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
    // 1. Агрегируем данные для отчёта.  
    const marketplaceCount: { [marketplace: string]: number } = {};  
    products.forEach((product) => {  
      const marketplace = product.marketplace;  
      if (!marketplaceCount[marketplace]) {  
        marketplaceCount[marketplace] = 0;  
      }  
      marketplaceCount[marketplace]++;  
    });  

    // Формируем текстовое заключение  
    const totalProducts = products.length;  
    let conclusion = `В отчете представлено ${totalProducts} товаров.\n`;  
    for (const [marketplace, count] of Object.entries(marketplaceCount)) {  
      conclusion += `Маркетплейс ${marketplace}: ${count} товаров.\n`;  
    }  

    // 2. Создаем временной canvas для построения диаграммы  
    const canvas = document.createElement('canvas');  
    canvas.width = 400;  
    canvas.height = 400;  
    document.body.appendChild(canvas);  
    const ctx = canvas.getContext('2d')!;  

    // Построение диаграммы с помощью Chart.js  
    const chartConfig: ChartConfiguration = {  
      type: 'pie',  
      data: {  
        labels: Object.keys(marketplaceCount),  
        datasets: [  
          {  
            label: 'Товары по маркетплейсам',  
            data: Object.values(marketplaceCount),  
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],  
          },  
        ],  
      },  
      options: {  
        responsive: false,  
        animation: { duration: 500 },  
      },  
    };  

    // @ts-ignore  
    new Chart(ctx, chartConfig);  

    // 3. Используем задержку, чтобы диаграмма успела отрендериться, затем создаем PDF  
    setTimeout(() => {  
      // Преобразуем диаграмму в изображение  
      const chartImage = canvas.toDataURL('image/png');  

      // Создаем новый PDF-документ  
      const pdf = new jsPDF({  
        orientation: 'portrait',  
        unit: 'mm',  
        format: 'a4',  
      });  

      pdf.addFileToVFS('Roboto-Regular.ttf', roboto.normal);  
      pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');  
      pdf.setFont('Roboto');  

      // Заголовок отчета  
      pdf.setFontSize(18);  
      pdf.text('Отчет по товарам', 10, 20);  

      // Добавляем диаграмму  
      pdf.addImage(chartImage, 'PNG', 10, 30, 100, 100);  

      // Добавляем текстовое заключение  
      pdf.setFontSize(12);  
      pdf.text('Заключение:', 10, 140);  
      const lines = pdf.splitTextToSize(conclusion, 180);  
      pdf.text(lines, 10, 150);  

      // Сохраняем результирующий PDF  
      pdf.save('report.pdf');  

      // Убираем временный canvas из DOM  
      document.body.removeChild(canvas);  
    }, 700);  
  }  
}