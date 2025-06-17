import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserPostsComponent } from './pages/user-posts/user-posts.component';
import { FavoritesListComponent } from './pages/favorites-list/favorites-list.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
    },
    {
        path: 'users',
        component: UserListComponent,
    },
    {
        path: 'users/:userId/posts',
        component: UserPostsComponent,
    },
    {
        path: 'favorites',
        component: FavoritesListComponent,
    },
    { path: '**', redirectTo: 'users' },
];
