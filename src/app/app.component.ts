import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AppwriteService } from './services/appwrite.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit {
  private appwriteService = inject(AppwriteService);

  ngOnInit() {
    this.appwriteService.refreshAuth();
  }
}
