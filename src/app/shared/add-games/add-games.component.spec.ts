import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGamesComponent } from './add-games.component';

describe('AddGamesComponent', () => {
  let component: AddGamesComponent;
  let fixture: ComponentFixture<AddGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AddGamesComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(AddGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
