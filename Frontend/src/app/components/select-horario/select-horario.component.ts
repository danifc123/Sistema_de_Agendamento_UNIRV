import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface HorarioOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-horario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-container">
      <label *ngIf="label" class="select-label">{{ label }}</label>
      <select
        class="select-field"
        [value]="value"
        (change)="onChange($event)"
        (blur)="onTouched()">
        <option value="">{{ placeholder }}</option>
        <option
          *ngFor="let option of opcoesHorarios"
          [value]="option.value">
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
      useExisting: forwardRef(() => SelectHorarioComponent),
      multi: true
    }
  ]
})
export class SelectHorarioComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Selecione um horário';
  @Input() inicioExpediente: string = '08:00';
  @Input() fimExpediente: string = '18:00';
  @Input() intervalo: number = 30; // intervalo em minutos

  value: string = '';
  disabled: boolean = false;
  opcoesHorarios: HorarioOption[] = [];

  ngOnInit() {
    this.gerarOpcoesHorarios();
  }

  ngOnChanges() {
    this.gerarOpcoesHorarios();
  }

  private gerarOpcoesHorarios(): void {
    this.opcoesHorarios = [];

    const inicio = this.converterParaMinutos(this.inicioExpediente);
    const fim = this.converterParaMinutos(this.fimExpediente);

    for (let minuto = inicio; minuto <= fim; minuto += this.intervalo) {
      const horario = this.converterParaHorario(minuto);
      this.opcoesHorarios.push({
        value: horario,
        label: horario
      });
    }
  }

  private converterParaMinutos(horario: string): number {
    const [hora, minuto] = horario.split(':').map(Number);
    return hora * 60 + minuto;
  }

  private converterParaHorario(minutos: number): string {
    const hora = Math.floor(minutos / 60);
    const minuto = minutos % 60;
    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  }

  onChange = (event: any) => {
    const value = event.target.value;
    this.value = value;
    this.propagateChange(value);
  };

  onTouched = () => {};

  writeValue(value: string): void {
    this.value = value;
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
