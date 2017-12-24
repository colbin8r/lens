import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { StreamPage } from '../stream/stream';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  goToStream() {
    this.navCtrl.push(StreamPage);
  }

}
