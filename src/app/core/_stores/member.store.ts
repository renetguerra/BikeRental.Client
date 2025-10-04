import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { toSignal, toObservable } from "@angular/core/rxjs-interop";
import { filter, switchMap, tap } from "rxjs";
import { AccountService } from "../_services/account.service";
import { MembersService } from "../_services/members.service";
import { Member } from "../_models/member";
import { UserParams } from "../_models/userParams";
import { Photo } from "../_models/photo";

@Injectable({ providedIn: 'root' })
export class MemberStore {

  private accountService = inject(AccountService);  
  private memberService = inject(MembersService);
  
  readonly user = computed(() => this.accountService.currentUser());

  private _member = signal<Member | null>(null);
  readonly member = this._member.asReadonly()  

  readonly userParams = signal<UserParams | null>(this.memberService.getUserParams()! ?? new UserParams(this.user()!));

  private triggerLoad = signal(false);

  readonly membersResponse = toSignal(
      toObservable(this.triggerLoad!).pipe(
        filter(load => load === true),
        switchMap(params =>
          this.memberService.getMembers(this.userParams()!).pipe(
            tap(res => {
              this.memberService.setUserParams(this.userParams()!);
              this.triggerLoad.set(false);
            })
          )
        )
      ),
      { initialValue: { result: [], pagination: undefined } }
    );
    
  readonly members = computed(() => this.membersResponse().result);
  readonly pagination = computed(() => this.membersResponse().pagination);

  readonly memberByUsername = toSignal(
      toObservable(computed(() => this.user()?.username)).pipe(
          filter((username): username is string => !!username),
          switchMap(username => this.memberService.getMember(username))
      ),
      { initialValue: null }
  );  
  
  readonly updateMember = (member: Member) => {
      return this.memberService.updateMember(member).pipe(
          tap(() => this.setMember(member))
      );
  };

  constructor() {           
    effect(() => {
      const value = this.memberByUsername();
      if (value) this._member.set(value);
    });
  }    

  loadMembers() {
    this.triggerLoad.set(true);
  }

  setUserParams(params: UserParams) {        
      this.userParams.set(structuredClone(params));
      this.memberService.setUserParams(params);
      this.loadMembers();
  }
    
  resetFilters() {        
      const resetParams = this.memberService.resetUserParams();
      this.userParams.set(structuredClone(resetParams!));
  }
  
  changePage(page: number) {
      const current = this.userParams();
      if (current && current.pageNumber() !== page) {
          const updated = structuredClone(current);
          updated.pageNumber.set(page);
          this.setUserParams(updated);            
      }
  }        
  
  setMember(member: Member) {
      this._member.set(member);        
  }    

  /*addPhotoLocal(photo: Photo) {
    this._member.update(member => member ? { ...member, photos: [...member.userPhotos, photo] } : member);
  }
  
  setMainPhotoLocal(photo: Photo) {
    this._member.update(member => {
      if (!member) return member;
      return {
        ...member,
        photoUrl: photo.url,
        photos: member.userPhotos.map(p => ({ ...p, isMain: p.id === photo.id }))
      };
    });
  }
  
  deletePhotoLocal(photoId: number) {
    this._member.update(member => member ? { ...member, photos: member.userPhotos.filter(p => p.id !== photoId) } : member);
  }*/
}