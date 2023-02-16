import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Query,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

export interface Row {
  hour: string;
  available: boolean;
}
/**
 * This UI component got pulled from the requirements, but its likely to be good for a bunch of use cases if it can become generic.
 * It's a list of rows that can be selected by dragging a finger over them.
 * I intended to make this into a directive that can be applied to a list of rows. It would then add its own ordinal to each row and use that to track the selection.
 *
 *
 * @export
 * @class HoursSelectorComponent
 * @implements {AfterViewInit}
 * @implements {OnInit}
 */
@Component({
  selector: 'app-hours-selector',
  templateUrl: './hours-selector.component.html',
  styleUrls: ['./hours-selector.component.scss'],
})
export class HoursSelectorComponent implements AfterViewInit, OnInit {

  @Input() rows!: Row[];
  @Output() rowsOutput = new EventEmitter<Row[]>();


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
      let lastTouchedOrdinal: number = -1;
      let previouslyTouchedOrdinal: number;
      let previousTouchedOrdinals: number[] = [];
      const removeTouchmoveListener = this.renderer.listen(
        event.target,
        'touchmove',
        (event) => {
          // prevent default to stop screen scrolling and chrome drag-to-refresh
          event.preventDefault();
          // Get the element that is currently being touchmoved over
          const el = this.getElementFromEvent(event)
          const currentTouchedOrdinal = this.ordinalFromEl(el);
          // debounce if the element is the same as the last one
          if (lastTouchedOrdinal === currentTouchedOrdinal) {
            return;
          } else {
            previouslyTouchedOrdinal = lastTouchedOrdinal
            lastTouchedOrdinal = currentTouchedOrdinal;
          }

          this.toggleRowSelection(el);

          /* Below are nice-to have functions but leaving for now... */

          // if direction changes, toggle row in selection
          // if (this.isSameDirection(currentTouchedOrdinal, previousTouchedOrdinals)) {
          //   previousTouchedOrdinals = [previousTouchedOrdinals[1], currentTouchedOrdinal];
          // } else {
          //   if (previouslyTouchedOrdinal) {
          //     this.toggleRowSelection(this.selectedRows.get(previouslyTouchedOrdinal));
          //   }
          //   previousTouchedOrdinals = [previousTouchedOrdinals[1], currentTouchedOrdinal];
          // }


          // this.addRowToSelection(el)
        }
      );
      this.renderer.listen(event.target, 'touchend', (event) => {
        event.preventDefault();
        this.sortSelectedRows();
        // this.removeAllDragHandles();
        // this.addDragHandleToFirstAndLastSelectedRow(Array.from(this.selectedRows));
        removeTouchmoveListener();
        this.rowsOutput.emit(this.getDataFromAllSelectedRows())
      });
    });
  }

  getDataFromAllSelectedRows(): Row[] {
    return Array.from(this.selectedRows.values()).map((row) => this.getDataFromRow(row));
  }

  getDataFromRow(row: HTMLElement): Row {
    const hour = row.dataset['hour']
    const available = !!row.dataset['available']
    console.log(`available: `, available, hour)
    if (hour && available) {
      return {
        hour,
        available
      }
    } else {
        throw new Error('Row does not have hour or available data')
      }
  }

  private toggleRowSelection(el: HTMLElement | undefined) {
    if (!this.rowIsInSelection(el as HTMLElement)) {
      this.addRowToSelection(el as HTMLElement);
    } else {
      this.removeRowFromSelection(el as HTMLElement);
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
  isSameDirection(currentTouchedOrdinal: number, previousTouchedOrdinals: number[]) {
    console.log(`previousClientYs: `, previousTouchedOrdinals)
    console.log(`currentClientY: `, currentTouchedOrdinal)
    if (previousTouchedOrdinals.length < 2) return true
    const wasGoingDown = previousTouchedOrdinals[0] < previousTouchedOrdinals[1];
    const isGoingDown = previousTouchedOrdinals[1] < currentTouchedOrdinal;
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
