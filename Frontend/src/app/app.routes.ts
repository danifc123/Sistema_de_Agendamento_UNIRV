import { Routes } from '@angular/router';
import { LayoutAuthComponent } from './layout/layout-auth/layout-auth.component';
import { LayoutDefaultComponent } from './layout/layout-default/layout-default.component';
import { LoginComponent } from './models/login/login.component';
import { RegisterComponent } from './models/register/register.component';
import { ForgetPasswordComponent } from './models/forget-password/forget-password.component';
import { CalendarioComponent } from './components/calendario/calendario.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: LayoutAuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
        data: { title: 'Login' }
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register' }
      },
      {
        path: 'forgetpassword',
        component: ForgetPasswordComponent,
        data: { title: 'Esqueceu Senha' }
      }
    ]
  },
  {
    path: '',
    component: LayoutDefaultComponent,
    children: [
      {
        path: '',
        component: CalendarioComponent,
        data: { title: 'Agenda' }
      }
    ]
  },
];
