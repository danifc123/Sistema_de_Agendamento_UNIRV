import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaAgendamentoComponent } from './tabela-agendamento.component';

describe('TabelaAgendamentoComponent', () => {
  let component: TabelaAgendamentoComponent;
  let fixture: ComponentFixture<TabelaAgendamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaAgendamentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaAgendamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
