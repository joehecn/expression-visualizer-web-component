export const sleep = (ms: number) =>
  // eslint-disable-next-line
  new Promise(resolve => setTimeout(resolve, ms));

export const triggerDragAndDrop = (
  elemDrag: Element,
  elemDrop: Element,
  offsetY = 0
) => {
  const DELAY_INTERVAL_MS = 10;
  const MAX_TRIES = 10;
  let dragStartEvent: DragEvent | null = null;

  const fireDragEvent = (
    type: string,
    elem: Element,
    clientX: number,
    clientY: number,
    dataTransfer?: DataTransfer
  ) => {
    const event = new DragEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX,
      clientY,
      screenX: clientX,
      screenY: clientY,
      relatedTarget: elem,
      dataTransfer: dataTransfer || new DataTransfer(),
    });

    elem.dispatchEvent(event);
    return event;
  };
  const firePointerEvent = (
    type: string,
    elem: Element,
    clientX: number,
    clientY: number
  ) => {
    const event = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      screenX: clientX,
      screenY: clientY,
      button: 0,
      which: 1,
    });
    event.preventDefault();
    elem.dispatchEvent(event);
  };
  const firePointerMoveEvent = (
    type: string,
    elem: Element,
    clientX: number,
    clientY: number
  ) => {
    const event = new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      screenX: clientX,
      screenY: clientY,
    });
    event.preventDefault();
    elem.dispatchEvent(event);
  };
  const fireMouseMoveEvent = (
    type: string,
    elem: Element,
    clientX: number,
    clientY: number
  ) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      screenX: clientX,
      screenY: clientY,
    });
    event.preventDefault();
    elem.dispatchEvent(event);
  };
  const fireMouseEvent = (
    type: string,
    elem: Element,
    clientX: number,
    clientY: number
  ) => {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      view: window,
      screenX: clientX,
      screenY: clientY,
      which: 1,
    });
    event.preventDefault();
    elem.dispatchEvent(event);
  };

  // fetch target elements
  if (!elemDrag || !elemDrop) return false;

  // calculate positions
  let pos = elemDrag.getBoundingClientRect();
  const center1X = Math.floor(pos.left + pos.width / 2);
  const center1Y = Math.floor(pos.top + pos.height / 2);
  pos = elemDrop.getBoundingClientRect();
  const center2X = Math.floor(pos.left + pos.width / 2);
  const center2Y = pos.bottom;
  let counter = 0;
  const startingDropRect = elemDrop.getBoundingClientRect();

  const rectsEqual = (r1: any, r2: any) =>
    r1.top === r2.top &&
    r1.right === r2.right &&
    r1.bottom === r2.bottom &&
    r1.left === r2.left;
  const drop = () => {
    console.log('DROP');
    if (!dragStartEvent) return;
    fireDragEvent(
      'drop',
      elemDrop,
      center2X,
      center2Y + offsetY,
      dragStartEvent!.dataTransfer!
    );
    fireMouseEvent('mouseup', elemDrop, center2X, center2Y + offsetY);
    firePointerEvent('pointerup', elemDrop, center2X, center2Y + offsetY);
  };
  const dragover = () => {
    counter += 1;
    console.log(`DRAGOVER #${counter}`);

    const currentDropRect = elemDrop.getBoundingClientRect();
    if (rectsEqual(startingDropRect, currentDropRect) && counter < MAX_TRIES) {
      if (counter !== 1)
        console.log("drop target rect hasn't changed, trying again");

      fireDragEvent(
        'dragover',
        elemDrop,
        center2X,
        center2Y + offsetY,
        dragStartEvent!.dataTransfer!
      );
      fireMouseMoveEvent('mousemove', elemDrop, center2X, center2Y + offsetY);
      firePointerMoveEvent(
        'pointermove',
        elemDrop,
        center2X,
        center2Y + offsetY
      );
      setTimeout(dragover, DELAY_INTERVAL_MS);
    } else {
      if (rectsEqual(startingDropRect, currentDropRect)) {
        console.log(
          `wasn't able to budge drop target after ${MAX_TRIES} tries, aborting`
        );
        fireDragEvent(
          'drop',
          elemDrop,
          center2X,
          center2Y + offsetY,
          dragStartEvent!.dataTransfer!
        );
        fireMouseEvent('mouseup', elemDrop, center2X, center2Y + offsetY);
        firePointerEvent('pointerup', elemDrop, center2X, center2Y + offsetY);
      } else {
        setTimeout(drop, DELAY_INTERVAL_MS);
      }
      setTimeout(drop, DELAY_INTERVAL_MS);
    }
  };

  // start dragging process
  console.log('DRAGSTART');

  firePointerEvent('pointerdown', elemDrag, center1X, center1Y);
  fireMouseEvent('mousedown', elemDrag, center1X, center1Y);
  dragStartEvent = fireDragEvent('dragstart', elemDrag, center1X, center1Y);

  setTimeout(dragover, DELAY_INTERVAL_MS);
  return true;
};
