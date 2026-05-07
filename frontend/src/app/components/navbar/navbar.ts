import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Bunu ekledik

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink], // Buraya da ekledik
  templateUrl: './navbar.html'
})
export class NavbarComponent {}