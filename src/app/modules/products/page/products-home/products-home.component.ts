import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: []
})

export class ProductsHomeComponent implements OnDestroy, OnInit {
  private readonly destroy$ = new Subject<void>();
  private ref!: DynamicDialogRef;
  productDatas: Array<GetAllProductsResponse> = [];

  constructor(
    private productsService: ProductsService,
    private productsDtService: ProductsDataTransferService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
  ){}

  ngOnInit(): void {
    this.getServiceProductsData()
  }


  getServiceProductsData() {
    const productsLoaded = this.productsDtService.getProductsDatas();

    if(productsLoaded.length > 0){
      this.productDatas = productsLoaded;
    } else this.getApiProductsDatas();
  }

  getApiProductsDatas() {
    this.productsService.getAllProduts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response.length > 0){
          this.productDatas = response;
        }
        },
        error: (err) => {
          console.log(err)
          this.messageService.clear();
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
    console.log(event)
    if(event){
      this.ref = this.dialogService.open(ProductFormComponent, {
        header: event.action,
        width: '70%',
        contentStyle: { overFlow: 'auto'},
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
          productDatas: this.productDatas
        }
      })
      this.ref.onClose
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.getApiProductsDatas()
        })
    }
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
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto deletado com sucesso!',
              life: 2500
            })
          }
          this.getApiProductsDatas()
        },
        error: (err) => {
          console.log(err)
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possivel deletar o produto!',
            life: 2500
          })

        }
      }))

    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
