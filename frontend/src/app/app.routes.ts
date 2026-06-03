import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AddListing } from './pages/add-listing/add-listing';
import { LoginPage } from './pages/login/login';
import { RegisterPage } from './pages/register/register';
import { ListingDetailPage } from './pages/listing-detail/listing-detail';
import { ProfilePage } from './pages/profile/profile';
import { MessagesPage } from './pages/messages/messages';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'listings/:id', component: ListingDetailPage },
  { path: 'profile', component: ProfilePage },
  { path: 'my-reservations', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'add-listing', component: AddListing },
  { path: 'messages', component: MessagesPage },
];
