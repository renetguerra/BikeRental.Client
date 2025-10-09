import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

import { UserManagementComponent } from './user-management.component';
import { AdminService } from 'src/app/core/_services/admin.service';
import { AdminUserStore } from 'src/app/core/_stores/adminUser.store';
import { User } from 'src/app/core/_models/user';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let adminUserStoreSpy: jasmine.SpyObj<AdminUserStore>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;

  const mockUsers: User[] = [
    {
      username: 'testuser1',
      roles: ['Admin'],
      token: '',
      photoUrl: '',
      knownAs: 'Test User 1',
      gender: 'male'
    },
    {
      username: 'testuser2',
      roles: ['Member'],
      token: '',
      photoUrl: '',
      knownAs: 'Test User 2',
      gender: 'female'
    }
  ];

  beforeEach(async () => {
    const adminServiceSpyObj = jasmine.createSpyObj('AdminService', ['getUsersWithRoles', 'updateUserRoles']);
    const adminUserStoreSpyObj = jasmine.createSpyObj('AdminUserStore', ['setUsers', 'updateUserRoles'], {
      users: jasmine.createSpy().and.returnValue(mockUsers)
    });
    const modalServiceSpyObj = jasmine.createSpyObj('BsModalService', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        UserManagementComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AdminService, useValue: adminServiceSpyObj },
        { provide: AdminUserStore, useValue: adminUserStoreSpyObj },
        { provide: BsModalService, useValue: modalServiceSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    adminUserStoreSpy = TestBed.inject(AdminUserStore) as jasmine.SpyObj<AdminUserStore>;
    modalServiceSpy = TestBed.inject(BsModalService) as jasmine.SpyObj<BsModalService>;

    // Setup default return values
    adminServiceSpy.getUsersWithRoles.and.returnValue(of(mockUsers));
    adminServiceSpy.updateUserRoles.and.returnValue(of(['Admin', 'Member']));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    component.ngOnInit();

    expect(adminServiceSpy.getUsersWithRoles).toHaveBeenCalled();
    expect(adminUserStoreSpy.setUsers).toHaveBeenCalledWith(mockUsers);
  });

  it('should have correct display columns', () => {
    expect(component.displayedColumns).toEqual(['username', 'roles', 'actions']);
  });

  it('should have available roles defined', () => {
    expect(component.availableRoles).toEqual(['Admin', 'Moderator', 'Member']);
  });

  it('should open roles modal when openRolesModal is called', () => {
    const mockUser = mockUsers[0];
    const mockModalRef = {
      content: { selectedRoles: ['Admin', 'Moderator'] },
      onHide: of(true)
    };
    modalServiceSpy.show.and.returnValue(mockModalRef as BsModalRef<unknown>);

    component.openRolesModal(mockUser);

    expect(modalServiceSpy.show).toHaveBeenCalled();
  });

  it('should update user roles when modal closes with different roles', () => {
    const mockUser = mockUsers[0];
    const newRoles = ['Admin', 'Moderator'];
    const mockModalRef = {
      content: { selectedRoles: newRoles },
      onHide: of(true)
    };
    modalServiceSpy.show.and.returnValue(mockModalRef as BsModalRef<unknown>);

    component.openRolesModal(mockUser);

    expect(adminUserStoreSpy.updateUserRoles).toHaveBeenCalledWith(mockUser.username, newRoles);
    expect(adminServiceSpy.updateUserRoles).toHaveBeenCalledWith(mockUser.username, newRoles);
  });

  it('should expose users from store', () => {
    expect(component.users).toBeDefined();
    expect(component.users()).toEqual(mockUsers);
  });
});
