import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { LikesService } from '../../core/services/likes-service';
import { Member } from '../../interfaces/member';
import { Lists } from './lists';

describe('Lists', () => {
  const member: Member = {
    id: 'member-1',
    dateOfBirth: '2000-01-01',
    displayName: 'Member',
    created: '2024-01-01',
    lastActive: '2024-01-01',
    gender: 'female',
    city: 'City',
    country: 'Country',
  };
  let toggleResult: Subject<object>;
  let likeIds: ReturnType<typeof signal<string[]>>;

  beforeEach(async () => {
    toggleResult = new Subject<object>();
    likeIds = signal([member.id]);
    await TestBed.configureTestingModule({
      imports: [Lists],
      providers: [
        provideRouter([]),
        {
          provide: LikesService,
          useValue: {
            likeIds,
            getLikes: () => of([member]),
            toggleLike: () => toggleResult,
          },
        },
      ],
    }).compileComponents();
  });

  function setup(tab?: string) {
    const fixture = TestBed.createComponent(Lists);
    fixture.detectChanges();
    if (tab) {
      const buttons = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      buttons.find(button => button.textContent?.trim() === tab)!.click();
      fixture.detectChanges();
    }
    return fixture;
  }

  it.each(['Liked', 'Mutual'])('removes an unliked member from %s after success', tab => {
    const fixture = setup(tab);
    fixture.nativeElement.querySelector('app-member-card button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-member-card')).not.toBeNull();

    toggleResult.next({});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-member-card')).toBeNull();
    expect(likeIds()).not.toContain(member.id);
  });

  it('keeps an unliked member in Liked By', () => {
    const fixture = setup('Liked By');
    fixture.nativeElement.querySelector('app-member-card button').click();
    toggleResult.next({});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-member-card')).not.toBeNull();
    expect(likeIds()).not.toContain(member.id);
  });

  it('keeps a newly liked member in Liked By', () => {
    likeIds.set([]);
    const fixture = setup('Liked By');
    fixture.nativeElement.querySelector('app-member-card button').click();
    toggleResult.next({});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-member-card')).not.toBeNull();
    expect(likeIds()).toContain(member.id);
  });

  it('keeps the member when an unlike fails', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const fixture = setup();
      fixture.nativeElement.querySelector('app-member-card button').click();
      toggleResult.error(new Error('Failed'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-member-card')).not.toBeNull();
      expect(likeIds()).toContain(member.id);
      expect(error).toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });
});
