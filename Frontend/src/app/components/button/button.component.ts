import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
@Input({required: true}) button?: string;
@Input() tipo?: string;
@Input() disabled?: boolean;
@Output() clicked = new EventEmitter<void>();

emitClick(): void {
  console.log('🔘 ButtonComponent - Click detectado, emitindo evento clicked');
  console.log('🔘 Botão:', this.button);
  console.log('🔘 Disabled:', this.disabled);
  this.clicked.emit();
}
}
