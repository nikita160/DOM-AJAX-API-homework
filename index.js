const itemsGenerator = document.querySelector('.items-generator');
const spacer = document.querySelector('.spacer');

const BOX_ITEM_WIDTH = 100;
const BOX_ITEM_HIGTH = BOX_ITEM_WIDTH;

let currentItem;

let currentX = 0;
let currentY = 0;

let shiftX = 0;
let shiftY = 0;

let elemBelow;

let isOverDropZone = false;

let currentContainer = null;

itemsGenerator.addEventListener('pointerdown', dragStartHandler, { once: true });
itemsGenerator.style.touchAction = 'none';
itemsGenerator.ondragstart = () => false;

function buildNewItem() {
    const box = document.createElement('div');
    box.style.width = `${BOX_ITEM_WIDTH}px`;
    box.style.height = `${BOX_ITEM_HIGTH}px`;
    box.classList.add('box-item');
    box.style.backgroundColor = getRandomColor();
    box.ondragstart = () => false;
    box.style.touchAction = 'none';
    itemsGenerator.appendChild(box);

    return box;
}

function dragStartHandler(event) {
    currentItem = buildNewItem();
    shiftX = event.clientX - currentItem.getBoundingClientRect().left;
    shiftY = event.clientY - currentItem.getBoundingClientRect().top;
    document.addEventListener('pointermove', draggingHandler);
    document.addEventListener('pointerup', dropHandler, { once: true });
    currentItem.classList.add('box-item-dragging');
}

function draggingHandler(event) {
    currentItem.style.pointerEvents = 'none';
    elemBelow = document.elementFromPoint(event.pageX, event.pageY);
    currentX = event.clientX;
    currentY = event.clientY;
    currentItem.style.left = `${currentX - shiftX}px`;
    currentItem.style.top = `${currentY - shiftY}px`;
    currentItem.style.pointerEvents = 'auto';

    if (isDropZone(elemBelow) !== isOverDropZone) {
        setCurrentContainer(elemBelow);
        isOverDropZone = !isOverDropZone;
        switchContainerHighlight();
        switchCursor();
    }
}

function dropHandler() {
    document.removeEventListener('pointermove', draggingHandler);
    currentItem.classList.remove('box-item-dragging');
    itemsGenerator.addEventListener('pointerdown', dragStartHandler, { once: true });
    currentItem.style.touchAction = 'auto';
    if (isOverDropZone) {
        currentItem.classList.add('box-item-dropped', 'drop-zone');
        currentContainer.appendChild(currentItem);
    } else {
        currentItem.remove();
        return;
    }

    if (currentContainer.classList.contains('box-container-grid')) {
        gridContainerDropHandler();
    }
    if (currentContainer.classList.contains('box-container-fluent')) {
        fluentContainerDropHandler();
    }
    switchCursor();
    currentItem = null;
    currentContainer = null;
    switchContainerHighlight();
    isOverDropZone = false;
}

function gridContainerDropHandler() {
    currentItem.style.position = 'static';
}

function fluentContainerDropHandler() {
    const parentX = currentContainer.getBoundingClientRect().left;
    const parentY = currentContainer.getBoundingClientRect().top;

    const outBoundX = currentX - shiftX - parentX + currentContainer.scrollLeft;
    const outBoundY = currentY - shiftY - parentY + currentContainer.scrollTop;

    currentItem.style.left = `${outBoundX}px`;
    currentItem.style.top = `${outBoundY}px`;

    if (outBoundX < 0) {
        [...currentContainer.children].forEach((element) => {
            element.style.left = `${element.offsetLeft - outBoundX}px`;
            spacer.style.width = `${spacer.offsetWidth - outBoundX}px`;
        });
        currentContainer.scrollLeft -= outBoundX;
    }

    if (outBoundY < 0) {
        [...currentContainer.children].forEach((element) => {
            element.style.top = `${element.offsetTop - outBoundY}px`;
            spacer.style.height = `${spacer.offsetHeight - outBoundY}px`;
        });
        currentContainer.scrollTop -= outBoundY;
    }
}

function isDropZone(elemBelow) {
    if (!elemBelow) {
        return false;
    }
    return elemBelow.classList.contains('drop-zone');
}

function setCurrentContainer(elemBelow) {
    if (isDropZone(elemBelow)) {
        currentContainer = elemBelow.closest('.box-container');
    } else {
        currentContainer = null;
    }
}

function switchContainerHighlight() {
    [...document.querySelectorAll('.box-container')].forEach((element) =>
        element.classList.remove('box-container-highlighted')
    );
    if (currentContainer) {
        currentContainer.classList.add('box-container-highlighted');
    }
}

function switchCursor() {
    currentItem.classList.toggle('box-item-avilable-drop');
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
