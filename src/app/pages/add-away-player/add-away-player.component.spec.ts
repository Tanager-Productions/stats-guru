import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAwayPlayerComponent } from './add-away-player.component';

describe('AddAwayPlayerComponent', () => {
  let component: AddAwayPlayerComponent;
  let fixture: ComponentFixture<AddAwayPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAwayPlayerComponent]
    });
    fixture = TestBed.createComponent(AddAwayPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
