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
        <span class="search-icon" matPrefix>🔍</span>
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
          (optionSelected)="onOptionSelected($event)"
          class="custom-autocomplete-panel">
          <mat-option
            *ngFor="let option of filteredOptions | async"
            [value]="option.value"
            class="custom-option">
            <div class="option-content">
              <span class="option-icon">{{ getOptionIcon(option.label) }}</span>
              <div class="option-details">
                <span class="option-name">{{ getMainName(option.label) }}</span>
                <div class="option-meta">
                  <span class="option-badge">{{ getCredential(option.label) }}</span>
                  <span class="option-secondary">{{ getSecondaryInfo(option.label) }}</span>
                </div>
              </div>
            </div>
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

    .search-icon {
      margin-right: 8px;
      font-size: 18px;
      opacity: 0.6;
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
      border-color: #ddd;
    }

    ::ng-deep .autocomplete-field input {
      font-size: 14px;
    }

    ::ng-deep .autocomplete-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .autocomplete-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .autocomplete-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #004F9F !important;
      border-width: 2px;
    }

    /* Estilos para as opções do autocomplete */
    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      width: 100%;
    }

    .option-icon {
      font-size: 24px;
      flex-shrink: 0;
      width: 32px;
      text-align: center;
    }

    .option-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
    }

    .option-name {
      font-weight: 600;
      font-size: 14px;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .option-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .option-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 12px;
      white-space: nowrap;
    }

    .option-secondary {
      font-size: 12px;
      color: #7f8c8d;
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ::ng-deep .mat-mdc-option.custom-option {
      min-height: 64px;
      padding: 4px 16px;
      line-height: normal;
    }

    ::ng-deep .mat-mdc-option.custom-option:hover {
      background: linear-gradient(90deg, rgba(0, 79, 159, 0.05) 0%, rgba(0, 79, 159, 0.1) 100%);
    }

    ::ng-deep .mat-mdc-option.custom-option.mat-mdc-option-active,
    ::ng-deep .mat-mdc-option.custom-option.mdc-list-item--selected {
      background: linear-gradient(90deg, rgba(0, 79, 159, 0.1) 0%, rgba(0, 79, 159, 0.15) 100%);
    }

    ::ng-deep .mat-mdc-autocomplete-panel.custom-autocomplete-panel {
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      margin-top: 4px;
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

  // Métodos auxiliares para formatar visualmente as opções
  getOptionIcon(label: string): string {
    // Se contém "Mat:" é aluno (👤), se contém "CRP:" é psicólogo (🧠)
    if (label.includes('Mat:')) {
      return '👤';
    } else if (label.includes('CRP:')) {
      return '🧠';
    }
    return '👥';
  }

  getMainName(label: string): string {
    // Extrair o nome antes do " - "
    const match = label.match(/^([^-]+)/);
    return match ? match[1].trim() : label;
  }

  getCredential(label: string): string {
    // Extrair "Mat: XXXXX" ou "CRP: XXXXX"
    const matMatch = label.match(/Mat:\s*([^(]+)/);
    if (matMatch) {
      return `Mat: ${matMatch[1].trim()}`;
    }
    const crpMatch = label.match(/CRP:\s*([^(]+)/);
    if (crpMatch) {
      return `CRP: ${crpMatch[1].trim()}`;
    }
    return '';
  }

  getSecondaryInfo(label: string): string {
    // Extrair o conteúdo entre parênteses (Curso ou Especialidade)
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }
}

