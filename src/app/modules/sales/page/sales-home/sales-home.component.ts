import { Component, OnInit } from '@angular/core';
import { SaleProduct } from 'src/app/models/interfaces/products/event/SaleProduct';
import { SaleProductResponse } from 'src/app/models/interfaces/products/response/SaleProductResponse';

@Component({
  selector: 'app-sales-home',
  templateUrl: './sales-home.component.html',
  styleUrls: ['./sales-home.component.scss']
})
export class SalesHomeComponent implements OnInit {
  public productsSale!: Array<SaleProduct>;

  getProductsSales(){
    const productsLocalStorage = localStorage.getItem("SaleProducts") as string;
    this.productsSale = JSON.parse(productsLocalStorage);
  }

  ngOnInit(): void {
   this.getProductsSales()
  }
}
