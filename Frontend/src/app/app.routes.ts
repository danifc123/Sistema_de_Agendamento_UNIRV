import { Routes } from '@angular/router';
import { LayoutAuthComponent } from './layout/layout-auth/layout-auth.component';
import { LayoutDefaultComponent } from './layout/layout-default/layout-default.component';
import { LoginComponent } from './models/login/login.component';
import { RegisterComponent } from './models/register/register.component';
import { ForgetPasswordComponent } from './models/forget-password/forget-password.component';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { HomeComponent } from './models/home/home.component';
import { AgendamentosComponent } from './models/agendamentos/agendamentos.component';
import { RelatorioComponent } from './models/relatorio/relatorio.component';
import { CadastrarAlunoComponent } from './models/cadastrar-aluno/cadastrar-aluno.component';
import { CadastrarPsicologoComponent } from './models/cadastrar-psicologo/cadastrar-psicologo.component';

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
        component: HomeComponent,
      },
      {
        path: 'agendamentos',
        component: AgendamentosComponent,
      },
      {
        path: 'relatorio',
        component: RelatorioComponent,
      },
      {
        path: 'cadastrar-aluno',
        component: CadastrarAlunoComponent,
      },
      {
        path: 'cadastrar-psicologo',
        component: CadastrarPsicologoComponent,
      }
    ]
  },
];
