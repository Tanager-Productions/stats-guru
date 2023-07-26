import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeriodTotalComponent } from './edit-period-total.component';

describe('EditPeriodTotalComponent', () => {
  let component: EditPeriodTotalComponent;
  let fixture: ComponentFixture<EditPeriodTotalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditPeriodTotalComponent]
    });
    fixture = TestBed.createComponent(EditPeriodTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
