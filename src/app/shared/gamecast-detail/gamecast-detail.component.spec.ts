import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamecastDetailComponent } from './gamecast-detail.component';

describe('GamecastDetailComponent', () => {
  let component: GamecastDetailComponent;
  let fixture: ComponentFixture<GamecastDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [GamecastDetailComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(GamecastDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
