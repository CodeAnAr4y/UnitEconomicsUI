import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';  


@Component({
  selector: 'app-add-seller-dialog',
  imports: [
    CommonModule,  
    ReactiveFormsModule,  
    MatDialogModule,  
    MatButtonModule,  
    MatButtonToggleModule,  
    MatInputModule,
  ],
  templateUrl: './add-seller-dialog.component.html',
  styleUrl: './add-seller-dialog.component.scss'
})
export class AddSellerDialogComponent {
  sellerForm: FormGroup;  

  constructor(  
    public dialogRef: MatDialogRef<AddSellerDialogComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: any,  
    private fb: FormBuilder  
  ) {  
    this.sellerForm = this.fb.group({  
      sellerName: ['', Validators.required]  
    });  
  }  

  onSubmit(): void {  
    if (this.sellerForm.valid) {  
      // Возвращаем введённое значение названия продавца  
      this.dialogRef.close(this.sellerForm.value);  
    } else {  
      console.log('Форма невалидна:', this.sellerForm.value);  
    }  
  }  

  onCancel(): void {  
    this.dialogRef.close();  
  }  
}
