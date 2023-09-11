import { read, save } from './localStorage';

export default class Trello {
  constructor() {
    this.originList = null;
    this.originPrevElSibling = null;
    this.pageEvents = document.querySelector('.container');
  }

  init() {
    const state = read();
    if (state) {
      document.body.innerHTML = state;
    }
    this.pageEvents.addEventListener('click', (e) => this.onAddTask(e));
    this.pageEvents.addEventListener('mouseover', (e) => this.onMouseOver(e));
    this.pageEvents.addEventListener('mouseout', (e) => this.onMouseOut(e));
    this.pageEvents.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.pageEvents.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  onAddTask(e) {
    if (e.target.classList.contains('addCard')) {
      const activeTextarea = document.querySelector('.new-task');
      if (activeTextarea) {
        const activeCard = activeTextarea.parentElement;
        activeTextarea.remove();
        activeCard.insertAdjacentHTML('beforeEnd', this.addButton()); 
      }

      const selectedCard = e.target.closest('.card');
      e.target.remove();
      selectedCard.insertAdjacentHTML('beforeEnd', this.newTaskForm());
      const taskForm = selectedCard.querySelector('.new-task');
      const list = selectedCard.querySelector('.list');
      const addBtn = taskForm.querySelector('.new-task__add');
      const cancelBtn = taskForm.querySelector('.new-task__cancel');
      const textBox = taskForm.querySelector('.new-task__content');
      textBox.removeAttribute('readonly');
      addBtn.addEventListener('click', () => {
        taskForm.remove();
        list.insertAdjacentHTML('beforeEnd', this.newItem(textBox.value));
        list.insertAdjacentHTML('afterEnd', this.addButton());
        save();
      });

      cancelBtn.addEventListener('click', () => {
        taskForm.remove();
        list.insertAdjacentHTML('afterEnd', this.addButton());
      });
    }
  }

  newItem(details) {
    return `
      <li class="item" draggable="true">${details}
        <span class="item__delete hidden">×</span>
      </li>`;
  }

  newTaskForm() {
    return `
      <div class='new-task'>
        <textarea class='new-task__content' placeholder='Pls type your task here...' required></textarea>
        <div class='new-task__controls'>
          <button class='new-task__add'>Add Card</button>
          <div class='new-task__cancel'>×</div>
        </div>
      </div>`;
  }

  addButton() {
    return `
      <div class="addCard">+ Add another card</div>`;
  }

  onMouseOver(e) {
    const item = e.target.closest('.item');
    if (item && item.querySelector('.item__delete').classList.contains('hidden')) {
      item.querySelector('.item__delete').classList.remove('hidden');
    }
  }

  onMouseOut(e) {
    const item = e.target.closest('.item');
    if (item && !item.querySelector('.item__delete').classList.contains('hidden')) {
      item.querySelector('.item__delete').classList.add('hidden');
    }
  }

  onMouseDown(e) {
    if (e.target.classList.contains('new-task__content')) return;
    if (e.target.classList.contains('addCard')) {
      this.pageEvents.addEventListener('click', (event) => this.onDeleteTask(event));
      return;
    }
    if (e.target.classList.contains('item__delete')) {
      e.target.closest('.item').remove();
      save();
      return;
    }
    e.preventDefault();
    this.currentItem = e.target.closest('.item');
    this.originList = this.currentItem.parentElement;
    this.originPrevElSibling = this.currentItem.previousElementSibling;
    if (this.currentItem) {
      this.currentItem.classList.add('dragged');
      this.pageEvents.addEventListener('mousemove', this.drag);
      this.pageEvents.addEventListener('mouseup', this.dragEnd);
      [...document.querySelectorAll('.card')].forEach((item) => {
        item.addEventListener('mouseup', this.itemDragEnd);
      });
    }
  }

  onMouseUp(e) {
    e.preventDefault();
  }

  onDeleteTask(e) {
    if (e.target.classList.contains('item__delete')) {
      e.target.closest('.item').remove();
      save();
    }
  }

  drag(e) {
    this.currentItem = document.querySelector('.dragged');
    if (!this.currentItem) return;
    this.currentItem.style.position = 'absolute';
    this.currentItem.style.left = `${e.clientX - 20}px`;
    this.currentItem.style.top = `${e.clientY - 20}px`;
  }

  dragEnd() {
    const draggedEl = document.querySelector('.dragged');
    if (!draggedEl) return;
    draggedEl.classList.remove('dragged');
    this.pageEvents.removeEventListener('mousemove', this.drag);
    this.pageEvents.removeEventListener('mouseup', this.dragEnd);
    save();
  }

  itemDragEnd(e) {
    const draggedEl = document.querySelector('.dragged');
    if (!draggedEl) return;
    const list = this.querySelector('.list');
    if (list) {
      list.insertBefore(draggedEl, e.target.closest('.item'));
    } else {
      this.originList.insertBefore(draggedEl, this.originPrevElSibling);
    }
    draggedEl.classList.remove('dragged');
    draggedEl.style = '';
    save();
  }
}
