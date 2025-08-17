import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-layout-auth',
  imports: [RouterOutlet],
  templateUrl: './layout-auth.component.html',
  styleUrl: './layout-auth.component.scss'
})
export class LayoutAuthComponent implements OnInit{
  constructor(
    private router: Router,
    protected route: ActivatedRoute,
    private authService: AuthService
  )
  {}
  ngOnInit(): void {
    // Verificar se o usuário já está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    this.updateTitles();
    this.routerSubscription = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe( () =>{
      this.updateTitles();
    });
  }

updateTitles(){
  const data = this.route.firstChild?.snapshot.data;
  this.title = data?.['title'] ?? '';
}
protected title?: string;
protected routerSubscription?: Subscription;
}
