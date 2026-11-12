import { Routes } from '@angular/router';
import { memberResolver } from '../features/members/member-resolver';
import { authGuard } from '../core/guards/auth-guard';
import { preventUnsavedChangesGuard } from '../core/guards/prevent-unsaved-changes-guard';
import { Home } from './../features/home/home';
import { MembersList } from '../features/members/members-list/members-list';
import { MemberDetails } from '../features/members/member-details/member-details';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { TestErrors } from '../features/test-errors/test-errors';
import { NotFound } from '../shared/not-found/not-found';
import { ServerError } from '../shared/server-error/server-error';
import { MemberProfile } from '../features/members/member-details/member-profile/member-profile';
import { MemberPhotos } from '../features/members/member-details/member-photos/member-photos';
import { MemberMessages } from '../features/members/member-details/member-messages/member-messages';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'members', component: MembersList },
      {
        path: 'members/:id',
        resolve: {
          member: memberResolver
        },
        runGuardsAndResolvers: 'always',
        component: MemberDetails,
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full',
          },
          {
            path: 'profile',
            component: MemberProfile,
            canDeactivate: [preventUnsavedChangesGuard],
            title: 'Profile',
          },
          {
            path: 'photos',
            component: MemberPhotos,
            title: 'Photos',
          },
          {
            path: 'messages',
            component: MemberMessages,
            title: 'Messages',
          },
        ],
      },
      { path: 'lists', component: Lists },
      { path: 'messages', component: Messages },
    ],
  },
  { path: 'errors', component: TestErrors },
  { path: 'server-error', component: ServerError },
  { path: '**', component: NotFound },
];
