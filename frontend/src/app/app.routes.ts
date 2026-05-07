import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AddListing } from './pages/add-listing/add-listing';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-listing', component: AddListing }
];