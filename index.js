const itemsGenerator = document.querySelector('.items-generator');
const spacer = document.querySelector('.spacer');
const layout = document.querySelector('.layout');

const gridContainer = document.querySelector('.box-container-grid');
const fluentContainer = document.querySelector('.box-container-fluent');

let currentItem;

let currentX = 0;
let currentY = 0;

let shiftX = 0;
let shiftY = 0;

let isOverContainer = false;

let currentContainer = null;

itemsGenerator.addEventListener('pointerdown', dragStartHandler, { once: true });
itemsGenerator.style.touchAction = 'none';
itemsGenerator.ondragstart = () => false;

function addContainersListeners() {
    gridContainer.addEventListener('pointerenter', overContainerHandler);
    gridContainer.addEventListener('pointerout', outContainerHandler);
    fluentContainer.addEventListener('pointerenter', overContainerHandler);
    fluentContainer.addEventListener('pointerout', outContainerHandler);
}

function removeContainersListeners() {
    gridContainer.removeEventListener('pointerenter', overContainerHandler);
    gridContainer.removeEventListener('pointerout', outContainerHandler);
    fluentContainer.removeEventListener('pointerenter', overContainerHandler);
    fluentContainer.removeEventListener('pointerout', outContainerHandler);
}

function overContainerHandler(event) {
    isOverContainer = true;
    currentContainer = event.target;
    setContainerHighlight(currentContainer);
}

function outContainerHandler() {
    isOverContainer = false;
    currentContainer = null;
    removeAllContainersHighlight();
}

function buildNewItem() {
    const box = document.createElement('div');
    box.classList.add('box-item');
    box.style.backgroundColor = getRandomColor();
    box.ondragstart = () => false;
    box.style.touchAction = 'none';
    return box;
}

function dragStartHandler(event) {
    itemsGenerator.releasePointerCapture(event.pointerId);
    currentItem = buildNewItem();
    currentItem.style.left = `${itemsGenerator.getBoundingClientRect().left}px`;
    currentItem.style.top = `${itemsGenerator.getBoundingClientRect().top}px`;
    document.body.appendChild(currentItem);
    shiftX = event.clientX - currentItem.getBoundingClientRect().left;
    shiftY = event.clientY - currentItem.getBoundingClientRect().top;
    document.addEventListener('pointermove', draggingHandler);
    document.addEventListener('pointerup', dropHandler, { once: true });
    currentItem.classList.add('box-item-dragging');
    addContainersListeners();

    itemsGenerator.classList.add('items-generator-disable');
    layout.classList.add('layout-no-drop');
}

function draggingHandler(event) {
    currentX = event.clientX;
    currentY = event.clientY;
    currentItem.style.left = `${currentX - shiftX}px`;
    currentItem.style.top = `${currentY - shiftY}px`;
}

function dropHandler() {
    document.removeEventListener('pointermove', draggingHandler);
    currentItem.classList.remove('box-item-dragging');
    itemsGenerator.addEventListener('pointerdown', dragStartHandler, { once: true });
    itemsGenerator.classList.remove('items-generator-disable');
    layout.classList.remove('layout-no-drop');
    removeAllContainersHighlight();
    removeContainersListeners();

    if (isOverContainer) {
        currentItem.classList.remove('box-item-dragging');
        currentContainer.appendChild(currentItem);
        if (currentContainer.classList.contains('box-container-grid')) {
            gridContainerDropHandler();
        }
        if (currentContainer.classList.contains('box-container-fluent')) {
            fluentContainerDropHandler();
        }
    } else {
        currentItem.remove();
    }
    isOverContainer = false;
    currentItem = null;
    currentContainer = null;
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

function setContainerHighlight(element) {
    element.classList.add('box-container-highlighted');
}

function removeAllContainersHighlight() {
    [...document.querySelectorAll('.box-container')].forEach((element) =>
        element.classList.remove('box-container-highlighted')
    );
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
