import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesHomeComponent } from './page/sales-home/sales-home.component';
import { RouterModule } from '@angular/router';
import { SALES_ROUTES } from './sales.routing';
import { SharedModule } from "../../shared/shared.module";
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [
    SalesHomeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(SALES_ROUTES),
    SharedModule,
    // PrimeNg
    TableModule,
    CardModule
  ],
})
export class SalesModule { }
