import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/response/GetCategoriesResponse';
import { CategoriesService } from 'src/app/services/categories/categories.service';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: []
})
export class CategoriesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponse> = [];

  ngOnInit(): void {
    this.getAllCategories();
  }

  constructor(
    private categoriesService: CategoriesService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ){}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

}
