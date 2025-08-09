import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatoriosADMComponent } from './relatorios-adm.component';

describe('RelatoriosADMComponent', () => {
  let component: RelatoriosADMComponent;
  let fixture: ComponentFixture<RelatoriosADMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosADMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatoriosADMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
