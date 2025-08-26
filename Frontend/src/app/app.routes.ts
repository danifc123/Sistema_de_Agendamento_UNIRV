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
import { EditarAlunoComponent } from './models/editar-aluno/editar-aluno.component';
import { EditarPsicologoComponent } from './models/editar-psicologo/editar-psicologo.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AnotacoesPsicologoComponent } from './models/anotacoes-psicologo/anotacoes-psicologo.component';

export const routes: Routes = [
  // Permitir acesso direto a /register redirecionando para /auth/register
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

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
    canActivate: [AuthGuard],
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
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'anotacoes',
        component: AnotacoesPsicologoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Psicologo'] }
      },
      {
        path: 'cadastrar-aluno',
        component: CadastrarAlunoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'cadastrar-psicologo',
        component: CadastrarPsicologoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'editar-aluno',
        component: EditarAlunoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'editar-psicologo',
        component: EditarPsicologoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] }
      }
    ]
  },
];
