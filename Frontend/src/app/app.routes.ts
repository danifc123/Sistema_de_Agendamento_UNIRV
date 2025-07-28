import { Routes } from '@angular/router';
import { LayoutAuthComponent } from './layout/layout-auth/layout-auth.component';
import { LoginComponent } from './models/login/login.component';
import { RegisterComponent } from './models/register/register.component';
import { forgetPasswordComponent } from './models/forgetPassword/forgetPasswordcomponent';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { LayoutDefaultComponent } from './layout/layout-default/layout-default.component';
export const routes: Routes = [
  {
    path: '',
    title: 'Agendamento UNIRV - Login',
    component:LayoutAuthComponent,
    children: [
      {
        path:'login',
        component:LoginComponent,
        data:{title:'Login'}
      },
      {
        path:'register',
        component:RegisterComponent,
        data:{title:'Register'}
      },
      {
        path:'forgetPassword',
        component:forgetPasswordComponent,
        data:{title:'Esqueceu Senha'}
      }
    ]
  },
  {
    path: 'default',
    title: 'Agendamento UNIRV',
    component: LayoutDefaultComponent,
  }
];
