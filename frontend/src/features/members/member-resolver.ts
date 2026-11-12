import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { EMPTY } from 'rxjs';
import { MemberService } from '../../core/services/member-service';
import { Member } from '../../interfaces/member';
import { Router } from '@angular/router';

export const memberResolver: ResolveFn<Member> = (route, state) => {
  const meberService = inject(MemberService);
  const memberId = route.paramMap.get('id');
  const router = inject(Router);
  if (!memberId) {
    router.navigateByUrl('/not-found');
    return EMPTY;
  }
  return meberService.getMember(memberId);
};
