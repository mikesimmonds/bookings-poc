import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Query,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-hours-selector',
  templateUrl: './hours-selector.component.html',
  styleUrls: ['./hours-selector.component.scss'],
})
export class HoursSelectorComponent implements AfterViewInit, OnInit {
  rows = [
    { hour: '10:00', available: true },
    { hour: '11:00', available: true },
    { hour: '12:00', available: true },
    { hour: '13:00', available: true },
    { hour: '14:00', available: true },
    { hour: '15:00', available: true },
    { hour: '16:00', available: true },
  ];

  @ViewChildren('hoursList', { read: ElementRef }) hourRows!: QueryList<
    ElementRef<HTMLElement>
  >;

  @ViewChild('dragHandle', { read: ElementRef })
  dragHandle!: ElementRef<HTMLElement>;

  selectedRows: Map<number, HTMLElement> = new Map();


  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.hourRows.forEach((row) => {
      this.addListenerToHourRow(row.nativeElement);
    });
  }

  addListenerToHourRow(row: HTMLElement) {
    this.renderer.listen(row, 'touchstart', (event) => {
      event.preventDefault();
      if (!this.isFirstOrLastRowInSelection(event.target)) {
        this.removeAllRowsFromSelection();
      }
      let lastTouchedOrdinal: number;
      let previouslyTouchedOrdinal: number;
      let previousClientYs: number[] = [];
      const removeTouchmoveListener = this.renderer.listen(
        event.target,
        'touchmove',
        (event) => {
          // prevent default to stop screen scrolling and chrome drag-to-refresh
          event.preventDefault();
          // Get the element that is currently being touchmoved over
          const currentTouchedOrdinal = this.ordinalFromEl(this.getElementFromEvent(event));
          // debounce if the element is the same as the last one
          if (lastTouchedOrdinal === currentTouchedOrdinal) {
            return;
          } else {
            previouslyTouchedOrdinal = lastTouchedOrdinal
            lastTouchedOrdinal = currentTouchedOrdinal;
          }

          // if direction changes, toggle row in selection
          if (this.isSameDirection(event.touches[0].clientY, previousClientYs)) {
            previousClientYs = [previousClientYs[1], event.touches[0].clientY];
          } else {
            if (previouslyTouchedOrdinal) {
              this.toggleRowSelection(this.selectedRows.get(previouslyTouchedOrdinal));
            }
            previousClientYs = [previousClientYs[1], event.touches[0].clientY];
          }

          this.toggleRowSelection(this.selectedRows.get(currentTouchedOrdinal));
        }
      );
      this.renderer.listen(event.target, 'touchend', (event) => {
        event.preventDefault();
        this.sortSelectedRows();
        // this.removeAllDragHandles();
        // this.addDragHandleToFirstAndLastSelectedRow(Array.from(this.selectedRows));
        removeTouchmoveListener();
      });
    });
  }

  private toggleRowSelection(el: HTMLElement | undefined) {
    if (this.rowIsInSelection(el as HTMLElement)) {
      this.removeRowFromSelection(el as HTMLElement);
    } else {
      this.addRowToSelection(el as HTMLElement);
    }
  }

  getElementFromEvent(event: TouchEvent): HTMLElement {
    return document.elementFromPoint(
      event.touches[0].clientX,
      event.touches[0].clientY
    ) as HTMLElement;
  }

  ordinalFromEl(el: HTMLElement): number {
    return Number(el.dataset['ordinal'])
  }

// [120, 130] 145
  isSameDirection(currentClientY: number, previousClientYs: number[]) {
    console.log(`previousClientYs: `, previousClientYs)
    console.log(`currentClientY: `, currentClientY)
    if (previousClientYs.length < 2) return true
    const wasGoingDown = previousClientYs[0] < previousClientYs[1];
    const isGoingDown = previousClientYs[1] < currentClientY;
    const sameDirection = wasGoingDown == isGoingDown;
    console.table([
      {wasGoingDown, isGoingDown, sameDirection}
    ])
    return sameDirection;
  }

  isFirstOrLastRowInSelection(row: HTMLElement) {
    const rowsArray = Array.from(this.selectedRows.keys());
    const rowOrdinal = this.ordinalFromEl(row);
    return rowOrdinal === rowsArray[0] || rowOrdinal === rowsArray[rowsArray.length - 1];
  }

  sortSelectedRows() {
    const selectedRowsArray = Array.from(this.selectedRows);
    selectedRowsArray.sort((a, b) => {
      const aOrdinal = a[0] || 0;
      const bOrdinal = b[0] || 0;
      return +aOrdinal - +bOrdinal;
    });
    this.selectedRows = new Map(selectedRowsArray);
  }

  addRowToSelection(row: HTMLElement) {
    const ordinal = this.ordinalFromEl(row);
    this.renderer.addClass(row, 'selected');
    this.selectedRows.set(ordinal, row);
  }

  rowIsInSelection(row: HTMLElement) {
    const ordinal = this.ordinalFromEl(row);
    return this.selectedRows.has(ordinal);
  }

  removeRowFromSelection(row: HTMLElement) {
    const ordinal = this.ordinalFromEl(row);
    this.renderer.removeClass(row, 'selected');
    this.selectedRows.delete(ordinal);
  }

  removeAllRowsFromSelection() {
    this.selectedRows.forEach((row) => {
      this.removeRowFromSelection(row);
    });
  }
}
