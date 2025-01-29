import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
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
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){}

  ngOnInit(): void {
    this.getServiceProductsData()
  }


  getServiceProductsData() {
    const productsLoaded = this.productsDtService.getProductsDatas();

    if(productsLoaded.length > 0){
      this.produtsData = productsLoaded;
    } else this.getApiProductsDatas();
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
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar produtos',
            life: 2500
          })
          this.router.navigate(['/dashboard'])
        }
      })
  }

  handleProductAction(event: EventAction): void {
    console.log('DADOS DO EVENTO RECEBIDO', event)
  }

  handleDeleteProductAction(event: {
    product_id: string,
    productName: string
  }): void {
    if(event){
      this.confirmationService.confirm({
        message: `Confirma a exclusão do produto: ${event.productName}`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteProduct(event.product_id)
      })
    }
  }

  deleteProduct(product_id: string) {
    if(product_id){
      this.productsService.deleteProduct(product_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({
        next: (response) => {
          if(response){
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto deletado com sucesso!',
              life: 2500
            })
          }
        },
        error: (err) => {
          console.log(err)
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel deletar o produto!',
            life: 2500
          })

        }
      }))

      this.getApiProductsDatas()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
