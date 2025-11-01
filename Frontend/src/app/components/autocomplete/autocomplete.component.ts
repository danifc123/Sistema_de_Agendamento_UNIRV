import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface AutocompleteOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="autocomplete-container">
      <label *ngIf="label" class="autocomplete-label">{{ label }}</label>
      <mat-form-field class="autocomplete-field" appearance="outline">
        <input
          type="text"
          matInput
          [placeholder]="placeholder"
          [formControl]="searchControl"
          [matAutocomplete]="auto"
          (blur)="onTouched()">
        <mat-autocomplete
          #auto="matAutocomplete"
          [displayWith]="displayFn.bind(this)"
          (optionSelected)="onOptionSelected($event)">
          <mat-option
            *ngFor="let option of filteredOptions | async"
            [value]="option.value">
            {{ option.label }}
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .autocomplete-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .autocomplete-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .autocomplete-field {
      width: 100%;
    }

    ::ng-deep .autocomplete-field .mat-mdc-form-field-flex {
      background: white;
    }

    ::ng-deep .autocomplete-field .mat-mdc-text-field-wrapper {
      background: white;
      padding-top: 0;
    }

    ::ng-deep .autocomplete-field .mat-mdc-form-field-infix {
      padding-top: 8px;
      padding-bottom: 8px;
      min-height: 40px;
    }

    ::ng-deep .autocomplete-field .mdc-notched-outline__leading,
    ::ng-deep .autocomplete-field .mdc-notched-outline__notch,
    ::ng-deep .autocomplete-field .mdc-notched-outline__trailing {
      border-width: 1px;
    }

    ::ng-deep .autocomplete-field input {
      font-size: 14px;
    }

    ::ng-deep .autocomplete-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .autocomplete-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .autocomplete-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #004F9F !important;
    }

    ::ng-deep .mat-mdc-option {
      min-height: 40px;
      font-size: 14px;
    }

    ::ng-deep .mat-mdc-option:hover {
      background-color: rgba(0, 79, 159, 0.1);
    }

    ::ng-deep .mat-mdc-option.mat-mdc-option-active {
      background-color: rgba(0, 79, 159, 0.1);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ]
})
export class AutocompleteComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Digite para buscar...';

  private _options: AutocompleteOption[] = [];
  @Input()
  set options(value: AutocompleteOption[]) {
    this._options = value;
    this.updateFilteredOptions();
  }
  get options(): AutocompleteOption[] {
    return this._options;
  }

  searchControl = new FormControl('');
  filteredOptions!: Observable<AutocompleteOption[]>;
  value: any = '';
  disabled: boolean = false;

  ngOnInit(): void {
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  private _filter(value: string | any): AutocompleteOption[] {
    // Se o valor for um ID (número), buscar pelo ID
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.options.filter(option =>
        option.label.toLowerCase().includes(filterValue)
      );
    }
    return this.options;
  }

  private updateFilteredOptions(): void {
    if (this.searchControl) {
      const currentValue = this.searchControl.value || '';
      this.filteredOptions = this.searchControl.valueChanges.pipe(
        startWith(currentValue),
        map(value => this._filter(value || ''))
      );
    }
  }

  displayFn(value: any): string {
    if (!value) return '';
    const option = this.options.find(opt => opt.value == value);
    return option ? option.label : '';
  }

  onOptionSelected(event: any): void {
    const selectedValue = event.option.value;
    this.value = selectedValue;
    this.propagateChange(selectedValue);
  }

  onTouched = () => { return; };

  writeValue(value: any): void {
    this.value = value;
    // Atualizar o campo de busca com o label correspondente
    if (value) {
      const option = this.options.find(opt => opt.value == value);
      if (option) {
        this.searchControl.setValue(value, { emitEvent: false });
      }
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  private propagateChange: (value: any) => void = () => { return; };
}

