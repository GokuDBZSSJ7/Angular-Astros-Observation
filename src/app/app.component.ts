import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpaceSceneComponent } from './components/space-scene/space-scene.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpaceSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'astros';
}
