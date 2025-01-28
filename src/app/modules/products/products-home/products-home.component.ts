import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: []
})

export class ProductsHomeComponent implements OnDestroy, OnInit {
  private readonly destroy$ = new Subject<void>();
  produtsData: Array<GetAllProductsResponse> = [];

  constructor(
    private productsService: ProductsService,
    private productsDtService: ProductsDataTransferService,
    private router: Router,
    private messaService: MessageService
  ){}

  ngOnInit(): void {
    this.getServiceProductsData()
  }


  getServiceProductsData() {
    const productsLoaded = this.productsDtService.getProductsDatas();

    if(productsLoaded.length > 0){
      this.produtsData = productsLoaded;
    } else this.getApiProductsDatas();

    console.log('DADOS DE PRODUTOS', this.produtsData)
  }

  getApiProductsDatas() {
    this.productsService.getAllProduts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response.length > 0){
          this.produtsData = response;
        }
        },
        error: (err) => {
          console.log(err)
          this.messaService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar produtos',
            life: 2500
          })
          this.router.navigate(['/dashboard'])
        }
      })
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

}
