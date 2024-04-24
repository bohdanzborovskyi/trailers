import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipListComponent } from './clip-list.component';

describe('ClipListComponent', () => {
  let component: ClipListComponent;
  let fixture: ComponentFixture<ClipListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClipListComponent]
    });
    fixture = TestBed.createComponent(ClipListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
