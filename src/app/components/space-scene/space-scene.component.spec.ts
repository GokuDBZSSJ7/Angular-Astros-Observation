import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceSceneComponent } from './space-scene.component';

describe('SpaceSceneComponent', () => {
  let component: SpaceSceneComponent;
  let fixture: ComponentFixture<SpaceSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceSceneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpaceSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
