import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';  
import * as XLSX from 'xlsx';  

@Component({  
  selector: 'app-drag-and-drop',  
  imports: [CommonModule],
  templateUrl: './drag-and-drop.component.html',  
  styleUrls: ['./drag-and-drop.component.scss']  
})  
export class DragAndDropComponent {  
  @Output() fileLoaded = new EventEmitter<any[]>();  
  isDragOver = false;  
  loadedFile: File | null = null; 

  @HostListener('dragover', ['$event'])  
  onDragOver(event: DragEvent): void {  
    event.preventDefault();  
    this.isDragOver = true;  
  }  

  @HostListener('dragleave', ['$event'])  
  onDragLeave(event: DragEvent): void {  
    event.preventDefault();  
    this.isDragOver = false;  
  }  

  @HostListener('drop', ['$event'])  
  onDrop(event: DragEvent): void {  
    event.preventDefault();  
    this.isDragOver = false;  
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {  
      const file = event.dataTransfer.files[0]; 
      this.loadedFile = file;
      event.dataTransfer.clearData();  
    }  
  }  

  onFileChange(event: any): void {  
    const file = event.target.files[0];  
    if (file) {  
      this.loadedFile = file;
    }  
  }  

  startProcess(){
    if (this.loadedFile) {
      this.readExcelFile(this.loadedFile);  
    }
  }

  private readExcelFile(file: File): void {  
    const reader = new FileReader();  
    reader.onload = (e: any) => {  
      const bstr: string = e.target.result;  
      const wb = XLSX.read(bstr, { type: 'binary' });  
      // Предполагаем, что данные находятся на первом листе  
      const wsName = wb.SheetNames[0];  
      const ws = wb.Sheets[wsName];  
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });  
      this.fileLoaded.emit(data);  
    };  
    reader.readAsBinaryString(file);  
  }  
}