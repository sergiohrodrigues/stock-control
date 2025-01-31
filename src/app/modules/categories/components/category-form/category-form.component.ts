import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
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

  public addCategory = CategoryEvent.ADD_CATEGORY_ACTION;
  public editCategory = CategoryEvent.EDIT_CATEGORY_ACTION;

  public categoryAction!: { event: EditCategoryAction };

  public categoryForm = this.formBuilder.group({
    name: ['', Validators.required]
  })

  constructor(
    private formBuilder: FormBuilder,
    private categorieService: CategoriesService,
    private messageService: MessageService
  ){}

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  handleSubmitAddCategory(){
    if(this.categoryForm.value && this.categoryForm.valid){
      const requestCreateCategory : {name: string } = {
        name: this.categoryForm.value.name as string
      }

      this.categorieService.addCategory(requestCreateCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if(response){
            // this.addProduct.emit({ action: this.addCategory })
            this.messageService.add({
              severity: 'success',
              summary: "Sucesso",
              detail: 'Categoria criada com sucesso!',
              life: 3000
            })
            this.categoryForm.reset();
          }
        },
        error: (err) => {
          console.log(err)
          this.categoryForm.reset();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
