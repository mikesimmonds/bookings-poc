import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursSelectorComponent } from './hours-selector.component';

describe('HoursSelectorComponent', () => {
  let component: HoursSelectorComponent;
  let fixture: ComponentFixture<HoursSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoursSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
