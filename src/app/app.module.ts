import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingComponent } from './booking/booking.component';
import { HoursSelectorComponent } from './booking/hours-selector/hours-selector.component';
import { DaySelectorComponent } from './booking/day-selector/day-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    BookingComponent,
    HoursSelectorComponent,
    DaySelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
