import { Routes } from '@angular/router';
import { LayoutAuthComponent } from './layout/layout-auth/layout-auth.component';
import { LoginComponent } from './models/login/login.component';
import { RegisterComponent } from './models/register/register.component';
export const routes: Routes = [
  {
    path: '',
    title: 'Agendamento UNIRV - Login',
    component:LayoutAuthComponent,
    children: [
      {
        path:'login',
        component:LoginComponent
      },
      {
        path:'register',
        component:RegisterComponent
      }
    ]
  },
];
