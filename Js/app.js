const addBtn = document.querySelectorAll(".add-item");
const columns = document.querySelectorAll(".column");

addBtn[0].addEventListener("click", addItems);
addBtn[1].addEventListener("click", addItems);
addBtn[2].addEventListener("click", addItems);

let drag = null;

mainArray = [];

if (localStorage.getItem("tasks")) {
  mainArray = JSON.parse(localStorage.getItem("tasks"));
}

getDataFromLoacalStorge();

/*
+========+
| Input |
+=======+
*/
function addItems(e) {
  let listItems = e.target.previousElementSibling;
  let itemInput = listItems.querySelectorAll(".item-input");
  let lastinputItem = itemInput[itemInput.length - 1];
  if (!lastinputItem || lastinputItem.textContent.trim() != "") {
    let item = document.createElement("div");
    item.className = "item input";
    item.innerHTML = `<div class="item-input" contenteditable ></div>
    `;
    listItems.appendChild(item);
    save(item);
  }
}

/*
+================+
| Parse   Input  |
+================+
*/
function save(item) {
  let input = item.firstElementChild;
  let btn = item.parentElement.nextElementSibling;
  input.focus();
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  });
  input.addEventListener("blur", (_) => {
    if (item.textContent.trim() != "") {
      addTaskToArray(item);
      item.remove();
      return;
    } else {
      item.remove();
    }
  });
}

function addTaskToArray(item, update) {
  let text = item.textContent.trim();
  let columnId = item.parentElement.parentElement.id;
  let task = {
    id: update || columnId,
    content: {
      id: Date.now(),
      title: text,
    },
  };
  mainArray.push(task);
  addTasksToPageFrom(mainArray);
  addDataToLocalStorgeFrom(mainArray);
}

function addTasksToPageFrom(mainArray) {
  columns.forEach((column) => {
    column.firstElementChild.nextElementSibling.innerHTML = "";
  });
  mainArray.forEach((task) => {
    let item = document.createElement("div");
    let time = new Date(task.content.id);
    item.className = "item";
    item.setAttribute("data-not", "");
    item.setAttribute("data-completed", "");
    item.setAttribute(
      "data-in",
      `${time.getDate()}-${time.getMonth() + 1}-${time.getFullYear()}`
    );
    item.setAttribute("data-id", task.content.id);
    item.setAttribute("draggable", true);
    item.innerHTML = `<div class="item-input" >${task.content.title}</div>
    <span class="item-control">
    <ion-icon name="create-outline"></ion-icon>
    <ion-icon name="trash-outline"></ion-icon>
    </span>
    `;

    delet(item);
    edit(item);

    if (task.id == 0) {
      columns[0].firstElementChild.nextElementSibling.appendChild(item);
    } else if (task.id == 1) {
      columns[1].firstElementChild.nextElementSibling.appendChild(item);
    } else if (task.id == 2) {
      columns[2].firstElementChild.nextElementSibling.appendChild(item);
    }
    dragItem();
  });
}

function delet(item) {
  let delet = item.lastElementChild.lastElementChild;
  delet.addEventListener("click", (_) => {
    item.remove();
    deleteTaskWith(item.getAttribute("data-id"));
  });
}

function edit(item) {
  let edit = item.lastElementChild.firstElementChild;
  let itemInput = item.firstElementChild;
  edit.addEventListener("click", (_) => {
    itemInput.setAttribute("contenteditable", "");
    itemInput.focus();
  });
  itemInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      itemInput.blur();
    }
  });
  itemInput.addEventListener("blur", (_) => {
    if (itemInput.textContent == "") {
      item.remove();
      deleteTaskWith(item.getAttribute("data-id"));
    } else {
      editTaskWith(item.getAttribute("data-id"), itemInput.innerHTML);
      itemInput.removeAttribute("contenteditable");
    }
  });
}

function addDataToLocalStorgeFrom(mainArray) {
  localStorage.setItem("tasks", JSON.stringify(mainArray));
}

function getDataFromLoacalStorge() {
  let data = localStorage.getItem("tasks");
  if (data) {
    let tasks = JSON.parse(data);
    addTasksToPageFrom(tasks);
  }
}

/*
+================+
|  Delete  Task  |
+================+
*/
function deleteTaskWith(taskId) {
  mainArray = mainArray.filter((task) => task.content.id != taskId);
  addDataToLocalStorgeFrom(mainArray);
}

/*
+================+
|  Edit    Task  |
+================+
*/
function editTaskWith(taskId, input) {
  mainArray = mainArray.map((task) => {
    if (task.content.id == taskId) {
      task.content.title = input;
    }
    return task;
  });

  addDataToLocalStorgeFrom(mainArray);
}

/*
+================+
|  Drag And Drop |
+================+
*/
function dragItem() {
  let items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("dragstart", (_) => {
      drag = item;
      item.style.opacity = "0.5";
      item.lastElementChild.style.display = "none ";
    });
    item.addEventListener("dragend", (_) => {
      drag = null;
      item.style.opacity = "1";
      item.lastElementChild.style.display = "block";
    });

    item.addEventListener("touchmove", (e) => {
      e.preventDefault();
      drag = item;
      [...e.changedTouches].forEach((touch) => {
        item.style.position = "absolute";
        item.style.top = `${
          touch.pageY - item.getBoundingClientRect().height / 2 - 25
        }px`;
        item.style.left = `${
          touch.pageX - item.getBoundingClientRect().width / 2
        }px`;
        item.style.opacity = "0.5";
      });
      if (item.parentElement.getBoundingClientRect().width > 230) {
        columns.forEach((column) => {
          if (
            column.getBoundingClientRect().top <
              item.getBoundingClientRect().top &&
            item.getBoundingClientRect().bottom <
              column.getBoundingClientRect().bottom
          ) {
            column.style.boxShadow = " 0px 0px 15px #8BF5FA";
          } else {
            column.removeAttribute("style");
          }
        });
      }
    });
    /*
+================+
|  Touch Events  |
+================+
*/
    item.addEventListener("touchend", (e) => {
      item.style.opacity = "1";
      columns.forEach((column) => {
        if (
          column.getBoundingClientRect().top <
            item.getBoundingClientRect().top &&
          item.getBoundingClientRect().bottom <
            column.getBoundingClientRect().bottom
        ) {
          if (drag) {
            column.firstElementChild.nextElementSibling.appendChild(drag);
            dragItemWith(drag.getAttribute("data-id"), column.id);
          }
          item.style.cssText = "position : relative; top: 0; left: 0";
          drag = null;
          column.removeAttribute("style");
        } else {
          ///
        }
      });
      item.style.cssText = "position : relative; top: 0; left: 0";
    });

    columns.forEach((column) => {
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.style.boxShadow = " 0px 0px 15px #8BF5FA";
      });
      column.addEventListener("dragleave", (_) => {
        column.removeAttribute("style");
      });
      column.addEventListener("drop", (_) => {
        if (drag) {
          column.firstElementChild.nextElementSibling.appendChild(drag);
          dragItemWith(drag.getAttribute("data-id"), column.id);
        }
        column.removeAttribute("style");
      });
    });
  });
}

/*
+================+
|  Move Task To  |
+================+
*/
function dragItemWith(dragId, columnId) {
  mainArray = mainArray.map((task) => {
    if (task.content.id == dragId) {
      task.id = columnId;
    }
    return task;
  });
  addDataToLocalStorgeFrom(mainArray);
}

/*
+================+
|  Time And Date |
+================+
*/
let inProgress = columns[0].lastElementChild.previousElementSibling.childNodes;
let completed = columns[2].lastElementChild.previousElementSibling.childNodes;

function time() {
  inProgress.forEach((item) => {
    let date = new Date(Date.now());
    let hour = date.getHours();
    let apm = "AM";
    if (hour > 12) {
      hour = hour - 12;
      apm = "PM";
    }

    minutes = date.getMinutes();

    let timeNow = `${hour}:${minutes} ${apm}`;
    item.dataset.not = timeNow;
  });
}

function date() {
  completed.forEach((item) => {
    if (item.dataset.completed == "") {
      let date = new Date(Date.now());
      let timeNow = `${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`;
      item.dataset.completed = timeNow;
    }
  });
}

setTimeout(() => {
  time();
  date();
}, 0);

setInterval(() => {
  time();
  date();
}, 1000);
