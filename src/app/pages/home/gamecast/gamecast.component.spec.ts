import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamecastComponent } from './gamecast.component';

describe('GamecastComponent', () => {
  let component: GamecastComponent;
  let fixture: ComponentFixture<GamecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamecastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
