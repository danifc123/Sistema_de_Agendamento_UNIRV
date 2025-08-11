import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="select-container">
      <label *ngIf="label" class="select-label">{{ label }}</label>
      <select
        class="select-field"
        (change)="onChange($event)"
        (blur)="onTouched()">
        <option value="">{{ placeholder }}</option>
        <option
          *ngFor="let option of options"
          [value]="option.value"
          [selected]="option.value == value">
          {{ option.label }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .select-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .select-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .select-field {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      background: white;
      transition: border-color 0.3s;
      cursor: pointer;
    }

    .select-field:focus {
      outline: none;
      border-color: #004F9F;
      box-shadow: 0 0 0 2px rgba(0, 79, 159, 0.1);
    }

    .select-field:hover {
      border-color: #004F9F;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Selecione uma opção';

  private _options: SelectOption[] = [];
  @Input()
  set options(value: SelectOption[]) {
    this._options = value;
    console.log('SelectComponent options atualizadas:', value);
    console.log('SelectComponent valor atual:', this.value);
  }
  get options(): SelectOption[] {
    return this._options;
  }

  value: any = '';
  disabled: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  onChange = (event: any) => {
    const value = event.target.value;
    this.value = value;
    this.propagateChange(value);
  };

  onTouched = () => {};

  writeValue(value: any): void {
    console.log('SelectComponent writeValue chamado com:', value);
    this.value = value;

    // Usar setTimeout para garantir que a atualização aconteça após o ciclo de detecção
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private propagateChange = (_: any) => {};
}
