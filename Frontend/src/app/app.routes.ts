import { Routes } from '@angular/router';
import { LayoutAuthComponent } from './layout/layout-auth/layout-auth.component';
export const routes: Routes = [
  {
    path: '',
    component:LayoutAuthComponent,
    children: []
  },
];
