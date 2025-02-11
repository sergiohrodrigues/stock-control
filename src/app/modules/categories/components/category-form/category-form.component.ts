import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { CategoryEvent } from 'src/app/models/enums/categories/CategoryEvent';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/event/EditCategoryAction';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CategoriesService } from 'src/app/services/categories/categories.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: []
})

export class CategoryFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  @Output() productEvent = new EventEmitter<EventAction>();
  // @Output() addProduct = new EventEmitter<EventAction>();
  public addCategoryAction = CategoryEvent.ADD_CATEGORY_ACTION;
  public editCategoryAction = CategoryEvent.EDIT_CATEGORY_ACTION;

  public categoryAction!: { event: EditCategoryAction };

  public categoryForm = this.formBuilder.group({
    name: ['', Validators.required]
  })

  constructor(
    public ref: DynamicDialogConfig,
    public refDialog: DynamicDialogRef,
    private formBuilder: FormBuilder,
    private categorieService: CategoriesService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.categoryAction = this.ref.data;

    if (this.categoryAction.event.action === this.editCategoryAction && this.categoryAction.event.categoryName !== null || undefined) {
      this.setCategoryName(this.categoryAction.event.categoryName as string)
    }
  }

  handleSubmitCategoryAction(): void {
    if(this.categoryAction.event.action === this.addCategoryAction){
      this.handleSubmitAddCategory()
    } else if (this.categoryAction.event.action === this.editCategoryAction) {
      this.handleSubmitEditCategory()
    }

    return;
  }

  handleSubmitEditCategory(): void{
    if(this.categoryForm.value && this.categoryForm.valid && this.categoryAction.event.id){
      const requestEditCategory: { name: string, category_id: string } = {
        name: this.categoryForm?.value?.name as string,
        category_id: this.categoryAction?.event?.id
      }

      this.categorieService.editCategory(requestEditCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.categoryForm.reset();
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: "Sucesso",
              detail: 'Categoria editada com sucesso!',
              life: 3000
            })
            this.refDialog.close();
          },
          error: (err) => {
            console.log(err)
            this.categoryForm.reset();
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: "Erro",
              detail: 'Erro ao editar a categoria',
              life: 3000
            })
          }
        })
    }
  }


  handleSubmitAddCategory() {
    if (this.categoryForm.value && this.categoryForm.valid) {
      const requestCreateCategory: { name: string } = {
        name: this.categoryForm.value.name as string
      }

      this.categorieService.addCategory(requestCreateCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              // this.addProduct.emit({ action: this.addCategory })
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: "Sucesso",
                detail: 'Categoria criada com sucesso!',
                life: 3000
              })
              this.refDialog.close();
              this.categoryForm.reset();
            }
          },
          error: (err) => {
            console.log(err)
            this.categoryForm.reset();
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: "Erro",
              detail: 'Erro ao criar categoria!',
              life: 3000
            })
          }
        })
    }
  }

  setCategoryName(categoryName: string): void {
    if (categoryName) {
      this.categoryForm.setValue({
        name: categoryName
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
