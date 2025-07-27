import { ComponentFixture, TestBed } from '@angular/core/testing';

import { forgetPasswordComponent } from './forgetPasswordcomponent';

describe('forgetPasswordComponent', () => {
  let component: forgetPasswordComponent;
  let fixture: ComponentFixture<forgetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [forgetPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(forgetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
