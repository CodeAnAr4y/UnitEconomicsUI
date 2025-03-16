import { Component, Inject } from '@angular/core';  
import { CommonModule } from '@angular/common';  
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';  
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';  
import { MatButtonModule } from '@angular/material/button';  
import { MatButtonToggleModule } from '@angular/material/button-toggle';  
import { MatInputModule } from '@angular/material/input';  

@Component({  
  selector: 'app-add-product-dialog',  
  standalone: true,  
  imports: [  
    CommonModule,  
    ReactiveFormsModule,  
    MatDialogModule,  
    MatButtonModule,  
    MatButtonToggleModule,  
    MatInputModule  
  ],  
  templateUrl: './add-product-dialog.component.html',  
  styleUrls: ['./add-product-dialog.component.scss']  
})  
export class AddProductDialogComponent {  
  productForm: FormGroup;  
  ozonColumns: any[];  
  wildberriesColumns: any[];  

  constructor(  
    public dialogRef: MatDialogRef<AddProductDialogComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: any,  
    private fb: FormBuilder  
  ) {  
    // Инициализируем столбцы из переданных данных.  
    this.ozonColumns = data.ozonColumns;  
    this.wildberriesColumns = data.wildberriesColumns;  

    // Создаем форму с контролом "marketplace"  
    this.productForm = this.fb.group({  
      marketplace: ['OZON', Validators.required],  
    });  

    // Добавляем контролы для всех полей OZON и Wildberries без начальных валидаторов  
    this.ozonColumns.forEach((col: any) => {  
      this.productForm.addControl(col.key, this.fb.control('test'));  
    });  
    this.wildberriesColumns.forEach((col: any) => {  
      if (!this.productForm.contains(col.key)) {  
        this.productForm.addControl(col.key, this.fb.control('test'));  
      }  
    });  

    // Устанавливаем валидаторы для выбранного маркетплейса по умолчанию  
    this.setValidators('OZON');  

    // При изменении маркетплейса обновляем валидаторы для соответствующих контаков  
    this.productForm.get('marketplace')?.valueChanges.subscribe((value: string) => {  
      this.setValidators(value);  
    });  
  }  

  private setValidators(marketplace: string): void {  
    // Для контролов OZON  
    this.ozonColumns.forEach((col: any) => {  
      const control = this.productForm.get(col.key);  
      if (marketplace === 'OZON') {  
        control?.setValidators(Validators.required);  
      } else {  
        control?.clearValidators();  
      }  
      control?.updateValueAndValidity();  
    });  

    // Для контролов Wildberries  
    this.wildberriesColumns.forEach((col: any) => {  
      const control = this.productForm.get(col.key);  
      if (marketplace === 'Wildberries') {  
        control?.setValidators(Validators.required);  
      } else {  
        control?.clearValidators();  
      }  
      control?.updateValueAndValidity();  
    });  
  }  

  onSubmit(): void {  
    if (this.productForm.valid) {  
      const marketplace = this.productForm.get('marketplace')?.value;  
      let productData: any = { marketplace };  

      const relevantColumns = marketplace === 'OZON' ? this.ozonColumns : this.wildberriesColumns;  
      relevantColumns.forEach((col: any) => {  
        productData[col.key] = this.productForm.get(col.key)?.value;  
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