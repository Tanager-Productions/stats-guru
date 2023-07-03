import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHomePlayerComponent } from './add-home-player.component';

describe('AddHomePlayerComponent', () => {
  let component: AddHomePlayerComponent;
  let fixture: ComponentFixture<AddHomePlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddHomePlayerComponent]
    });
    fixture = TestBed.createComponent(AddHomePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
