import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StreamPage } from './stream';

@NgModule({
  declarations: [
    StreamPage,
  ],
  imports: [
    IonicPageModule.forChild(StreamPage),
  ],
})
export class StreamPageModule {}
