import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import {of} from "rxjs";
import {AuthService} from "../services/auth.service";
import {RouterTestingModule} from "@angular/router/testing";
import {By} from "@angular/platform-browser";

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  const mockedAuthService = jasmine.createSpyObj('AuthService', [
    'createUser', 'logout'
  ], {
    isAuthenticated$: of(true),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavComponent ],
      imports:[RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: mockedAuthService
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be hidden authlinks', ()=>{
    const authLinks = fixture.debugElement.queryAll(By.css('li'))
    expect(authLinks.length).withContext('Not logged in').toBe(4)
  });

  it('should be logout', ()=>{
    const logoutLink = fixture.debugElement.query(By.css('li:nth-child(3) a'))
    expect(logoutLink).withContext('Not logged in').toBeTruthy()
    logoutLink.triggerEventHandler('click')
    const service = TestBed.inject(AuthService)
    expect(service.logout).withContext('Could not click logout link').toHaveBeenCalled();
  });
});
