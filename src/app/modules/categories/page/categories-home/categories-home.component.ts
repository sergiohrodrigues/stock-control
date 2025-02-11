import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, take, takeUntil } from 'rxjs';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/event/DeleteCategoryAction';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/response/GetCategoriesResponse';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { ProductsService } from 'src/app/services/products/products.service';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: []
})
export class CategoriesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  private ref!: DynamicDialogRef;
  public categoriesDatas: Array<GetCategoriesResponse> = [];
  public productsData: Array<GetAllProductsResponse> = [];

  ngOnInit(): void {
    this.getAllCategories();
    this.getAllProducts();
  }

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ){}

  getAllCategories() {
    this.categoriesService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if(response.length > 0){
            this.categoriesDatas = response;
          }
        },
        error: (err) => {
          console.log(err)
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar categorias!',
            life: 2500
          })
          this.router.navigate(['/dashboard'])
        }
      })
  }

  getAllProducts(){
    this.productsService.getAllProduts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.productsData = response
        },
        error: (err) => {
          console.log(err)
        }
      })
  }

  handleDeleteCategoryAction(event: DeleteCategoryAction): void {
    if(event){
      this.confirmationService.confirm({
        message: `Confirma a exclusão da categoria: ${event.categoryName}`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteCategory(event.category_id)
      })
    }
  }

  handleCategoryAction(event: EventAction): void {
    if(event){
      this.ref = this.dialogService.open(CategoryFormComponent, {
        header: event.action,
        width: '70%',
        contentStyle: { overFlow: 'auto'},
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
          productDatas: this.categoriesDatas
        }
      })
      this.ref.onClose
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.getAllCategories()
        })
    }
  }

  deleteCategory(category_id: string) {
    const categoryExistent = this.productsData.filter(prodct => prodct.category.id === category_id);

    if(categoryExistent.length > 0){
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Existem produtos com essa categoria, então não é possivel remove-lá',
        life: 5000
      })
      return
    }

    if(category_id){
      this.categoriesService.deleteCategory({ category_id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Suceso',
              detail: 'Categoria removida com sucesso!',
              life: 3000
            })
            this.getAllCategories()
          },
          error: (err) => {
            console.log(err);
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover categoria!',
              life: 3000
            })
          }
        })

        this.getAllCategories()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

