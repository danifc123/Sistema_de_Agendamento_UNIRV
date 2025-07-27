import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutAuthComponent } from './layout-auth.component';

describe('LayoutAuthComponent', () => {
  let component: LayoutAuthComponent;
  let fixture: ComponentFixture<LayoutAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
