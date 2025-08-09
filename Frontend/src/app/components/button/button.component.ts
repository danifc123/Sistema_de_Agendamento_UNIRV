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
@Output() clicked = new EventEmitter<void>();
}
