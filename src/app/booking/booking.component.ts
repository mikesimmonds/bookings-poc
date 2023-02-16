import { Component, OnInit } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { Row } from './hours-selector/hours-selector.component';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

rows: Row[] = [
    { hour: '10:00', available: true },
    { hour: '11:00', available: true },
    { hour: '12:00', available: true },
    { hour: '13:00', available: true },
    { hour: '14:00', available: true },
    { hour: '15:00', available: true },
    { hour: '16:00', available: true },
  ];

  constructor(
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
  }


  handleSelectedRows(rows: Row[]) {
    this.modalService.alert({
      title: 'Selected rows',
      message: ` you have selected the following rows: \n ${rows.map((row) => row.hour).join(', ')}`,
    });
  }

}
