import { Routes } from '@angular/router';
import { LayoutAuthComponent } from './layout/layout-auth/layout-auth.component';
import { LoginComponent } from './models/login/login.component';
export const routes: Routes = [
  {
    path: 'login',
    title: 'Agendamento UNIRV - Login',
    component:LayoutAuthComponent,
    children: [
      {
        path:'',
        component:LoginComponent
      }
    ]
  },
];
