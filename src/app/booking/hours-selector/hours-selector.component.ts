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

  selectedRows: Set<HTMLElement> = new Set();

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
      if (!this.isFirstOrLastRow(event.target)) {
        this.removeAllRowsFromSelection();
      }
      let currentlyTouchedRow: Element | null;
      let previouslyTouchedRow: Element | null;
      let previousClientYs: number[] = [];
      const removeTouchmoveListener = this.renderer.listen(
        event.target,
        'touchmove',
        (event) => {
          // prevent default to stop screen scrolling and chrome drag-to-refresh
          event.preventDefault();
          // Get the element that is currently being touchmoved over
          const el = document.elementFromPoint(
            event.touches[0].clientX,
            event.touches[0].clientY
          );
          // debounce if the element is the same as the last one
          if (currentlyTouchedRow === el) {
            return;
          } else {
            previouslyTouchedRow = currentlyTouchedRow
            currentlyTouchedRow = el;
          }

          // if direction changes, toggle row in selection
          if (this.isSameDirection(event.touches[0].clientY, previousClientYs)) {
            previousClientYs = [previousClientYs[1], event.touches[0].clientY];
          } else {
            if (previouslyTouchedRow) {
              this.toggleRowSelection(previouslyTouchedRow as HTMLElement);
            }
            previousClientYs = [previousClientYs[1], event.touches[0].clientY];
          }

          this.toggleRowSelection(el);
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

  private toggleRowSelection(el: Element | null) {
    if (this.rowIsInSelection(el as HTMLElement)) {
      this.removeRowFromSelection(el as HTMLElement);
    } else {
      this.addRowToSelection(el as HTMLElement);
    }
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

  isFirstOrLastRow(row: HTMLElement) {
    const rowsArray = Array.from(this.selectedRows);
    return row === rowsArray[0] || row === rowsArray[rowsArray.length - 1];
  }


  addListenerToDragHandle(handle: HTMLElement) {
    this.renderer.listen(handle, 'touchstart', (event) => {
      console.log('ts');
      event.stopPropagation();
      let currentlyTouchedRow: Element | null;
      const removeTouchmoveListener = this.renderer.listen(
        event.target,
        'touchmove',
        (event) => {
          const el = document.elementFromPoint(
            event.touches[0].clientX,
            event.touches[0].clientY
          );
          if (currentlyTouchedRow === el) {
            return;
          } else currentlyTouchedRow = el;
          if (this.rowIsInSelection(el as HTMLElement)) {
            console.log('removign row to selection from handle');
            this.removeRowFromSelection(el as HTMLElement);
            return;
          } else {
            if (!this.rowIsInSelection(el as HTMLElement)) {
              console.log('adding row to selection from handle');
              this.addRowToSelection(el as HTMLElement);
            }
          }
        }
      );
      this.renderer.listen(event.target, 'touchend', (event) => {
        this.sortSelectedRows();
        this.removeAllDragHandles();
        this.addDragHandleToFirstAndLastSelectedRow(
          Array.from(this.selectedRows)
        );
        removeTouchmoveListener();
      });
    });
  }

  addDragHandleToFirstAndLastSelectedRow(selectedRowsArray: HTMLElement[]) {
    selectedRowsArray.forEach((row) => {
      if (row === selectedRowsArray[0]) {
        this.addDragHandleToRow(row, true);
      }
      if (row === selectedRowsArray[selectedRowsArray.length - 1]) {
        this.addDragHandleToRow(row, false);
      }
    });
  }

  addDragHandleToRow(row: HTMLElement, isTop: boolean = false) {
    const dragHandle = this.renderer.createElement('div');
    this.renderer.addClass(dragHandle, 'drag-handle');
    this.renderer.addClass(dragHandle, isTop ? 'top' : 'bottom');
    this.renderer.appendChild(row, dragHandle);
    this.addListenerToDragHandle(dragHandle);
  }

  removeAllDragHandles() {
    document.querySelectorAll('.drag-handle').forEach((handle) => {
      handle.remove();
    });
  }

  // addDragHandleToRow(row: HTMLElement) {
  //   this.renderer.appendChild(row, this.dragHandle);
  //   this.addListenerToDragHandle(this.dragHandle.nativeElement);
  // }

  sortSelectedRows() {
    const selectedRowsArray = Array.from(this.selectedRows);
    selectedRowsArray.sort((a, b) => {
      const aOrdinal = a.dataset['ordinal'] || 0;
      const bOrdinal = b.dataset['ordinal'] || 0;
      return +aOrdinal - +bOrdinal;
    });
    this.selectedRows = new Set(selectedRowsArray);
  }

  addRowToSelection(row: HTMLElement) {
    this.renderer.addClass(row, 'selected');
    this.selectedRows.add(row);
  }

  rowIsInSelection(row: HTMLElement) {
    return this.selectedRows.has(row);
  }

  removeRowFromSelection(row: HTMLElement) {
    this.renderer.removeClass(row, 'selected');
    this.selectedRows.delete(row);
  }

  removeAllRowsFromSelection() {
    this.selectedRows.forEach((row) => {
      this.removeRowFromSelection(row);
    });
  }
}
