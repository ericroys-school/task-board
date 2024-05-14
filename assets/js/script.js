import {
  DESCRIPTION,
  DUEDATE,
  STATE,
  STATEVAL,
  TITLE,
  ID,
  getListEntries,
  createEntry,
  getEntry,
  deleteEntry,
  setStatus,
} from "./taskStore.js";

//moved this into the list render function where it is better because it is
//encapsulated where it needs to be
// let taskList = getStorageEntries();

// Retrieve tasks and nextId from localStorage
// don't need this. 
//let nextId = JSON.parse(localStorage.getItem("nextId"));

/* a mapping between our task model key and the form input id 
   note: technically they are same at this point, but if key on 
   either side changes, it's simply enough to remap here
*/
const kvMapping = {};
kvMapping[TITLE] = TITLE;
kvMapping[DUEDATE] = DUEDATE;
kvMapping[DESCRIPTION] = DESCRIPTION;

/*shorter is better */
const lane = {
  TODOID: "todo-cards",
  WIPID: "in-progress-cards",
  DONEID: "done-cards",
};

/* map status to lane */
const statusLane = {};
statusLane[lane.TODOID] = STATEVAL.TODO;
statusLane[lane.WIPID] = STATEVAL.WIP;
statusLane[lane.DONEID] = STATEVAL.COMPLETE;

/* card colorings for different states */
const cardColoring = {
  LATE: "card-late",
  WARN: "card-warn",
  GOOD: "card-good",
};

/**
 * Create a task card
 * @param task a task data object
 * @param state a css class to associate for colorings
 * @returns
 */
function createTaskCard(task, state) {
  if (!task) return null;

  //default to late if not provided since it will draw most attention
  const c = !state ? cardColoring.LATE : state;

  const card = $(`
  <div class="card ${c} " id="${task[ID]}">
  <div class="card-body">
  <h5 class="card-title">${task[TITLE]}</h5>
  <h6 class="card-subtitle">${dayjs(
    dayjs(task[DUEDATE])
  ).format("MM/DD/YYYY")}</h6>
  <p class="card-text">${task[DESCRIPTION]}
  </p><button class="btn-delete btn btn-primary" data-id="${
    task[ID]
  }">Delete</button>
  </div>
  </div>
`)
    .data("text", task[ID])
    .draggable({
      cursor: "move",
      revert: true,
    });
  return card;
}

/**
 * Get the css class for appropriate state of task
 * @param STATEVAL state
 * @param number timein (milliseconds)
 * @returns
 */
function getCardStatus(state, timein) {
  //ms in a day
  const aday = 86400 * 1000;

  /* if we don't have state or timein or we have not complete state that 
     exceeds a day then it's late.
   */
  if (
    !state ||
    !timein ||
    (state !== STATEVAL.COMPLETE && dayjs().valueOf() - timein > aday)
  )
    return cardColoring.LATE;
  /* if completed or is a future date */ else if (
    state === STATEVAL.COMPLETE ||
    dayjs().valueOf() - timein < 0
  )
    return cardColoring.GOOD;
  /* within a day window so it's fair warning
   */ else return cardColoring.WARN;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  //clear the lanes so don't end up with duplicates
  Object.values(lane).map((item) => $(`#${item}`).empty());
  //get refreshed items from storage
  const taskList = getListEntries();
  //do nothing if nothing otherwise something
  if (!taskList || taskList.length < 1) return;

  //map state to the container
  const stateMap = {};
  stateMap[STATEVAL.TODO] = `#${lane.TODOID}`;
  stateMap[STATEVAL.WIP] = `#${lane.WIPID}`;
  stateMap[STATEVAL.COMPLETE] = `#${lane.DONEID}`;

  taskList.forEach((t) => {
    let card = null;
    //create a card and append to appropriate swim lane with appropriate state
    //colorings
    if ((card = createTaskCard(t, getCardStatus(t[STATE], t[DUEDATE])))) {
      //create in appropriate container
      $(stateMap[t[STATE]]).append(card);
    }
  });
}

/**
 * Sets the css for an element to 'is-invalid' as is done for 
 * the process of form validation
 * @param {*} element
 */
function setInputInvalid(element) {
  const invalid = "is-invalid";
  //set invalid class to make the input red and display error text
  if (!element.hasClass(invalid)) element.addClass(invalid);
}

/**
 * Validate form inputs
 * @param {*} elements -> the elements to validate
 * @returns true if valid otherwise false
 */
function validateAddTask(elements) {
  let isValid = true;

  const invalid = "is-invalid";
  elements.each(function () {
    let x = null;
    if (!(x = $(this).val()) || x === "") {
      // set flag for invalid entry
      isValid = false;
      // call function to set the css for invalid/messaging
      setInputInvalid($(this));
    } else {
      //clear any errors so shows no errors for corrected entry
      if ($(this).attr("id") !== "taskDueDate") {
        $(this).removeClass(invalid);
      } else {
        /* add fail-safe validation of the date. Technically
                   though the input is set as read-only and user can only 
                   select date from date-picker
                */
        //use dayjs to validate the date input
        if (!dayjs($(this).val()).isValid()) {
          //set overall invalid flag
          isValid = false;
          // call function to set the css for invalid/messaging
          setInputInvalid($(this));
        } else {
          //clear error condition
          $(this).removeClass(invalid);
        }
      }
    }
  });

  return isValid;
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  //get all the inputs we care about
  let formInputs = $("#taskTitle, #taskDueDate, #taskDescription");
  //if inputs are invalid return otherwise store them
  if (!validateAddTask(formInputs)) return;
  //build object
  const task = {};
  formInputs.each(function () {
    task[kvMapping[$(this).attr("id")]] = $(this).val();
    //clear the entry while we are at it
    $(this).val("");
  });

  //send to storage
  createEntry(task);
  //close the modal
  $("#createTaskModal").modal("hide");
  //refresh the list from storage
  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  //get the id we stored in the data attribute
  let id = $(event.target).attr("data-id");
  //remove from storage
  deleteEntry(id);
  //remove from ui
  $(`#${id}`).remove();
}

/**
 * Helper function to determin if an item can be dropped on an element
 * @param {*} target 
 * @param {*} taskId 
 * @returns 
 */
function isAccepted(target, taskId) {
  if (!target || !taskId) return false;

  //get the task from storage to get the current status
  let entry = null;
  const status = (entry = getEntry(taskId)) ? entry[STATE] : null;
  if (!status) {
    console.log(`warn: unable to get status for ${taskId}`);
    return false;
  }
  //only allow wip to transition back to to-do
  if (target === lane.TODOID) return status === STATEVAL.WIP;
  //only allow todo to transition to wip
  if (target === lane.WIPID) return status === STATEVAL.TODO;
  //anything can transition to done
  if (target === lane.DONEID)
    return status === STATEVAL.TODO || status === STATEVAL.WIP;
  //anything else is not acceptable
  return false;
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let a = event.target.id;
  let b = ui.draggable.data("text");

  if (!isAccepted(a, b)) return;
  //update the task status in storage
  setStatus(b, statusLane[a]);

  //to the moving in the lanes, etc
  //get the elements
  let x = $(`#${a}`);
  let y = $(`#${b}`);
  //get rid of relative positioning from styling
  y.removeAttr("style");
  //put draggable into droppable
  x.append(y);

  //clear colorings for done items
  if (a === lane.DONEID){
    let c = ui.draggable.attr("class")
    .replace(cardColoring.LATE, cardColoring.GOOD)
    .replace(cardColoring.WARN, cardColoring.GOOD);
    ui.draggable.attr("class", c);
  } 
}

// Todo: when the page loads, render the task list,
//add event listeners, make lanes droppable,
//and make the due date field a date picker
$(document).ready(function () {
  // add date picker
  $("#taskDueDate").datepicker();
  //add listener to addTask button
  $("#btnAddTask").on("click", handleAddTask);
  //show task list
  renderTaskList();
  //make all the lanes droppable
  makeDroppable(Object.values(lane));
  //add delegate delete
  makeDeleteDelegate(Object.values(lane));
});

/**
 * Add delete delegation to items
 * @param {*} items 
 */
function makeDeleteDelegate(items) {
  items.forEach((item) => {
    console.log(item);
    let x = $(`#${item}`);
    x.on("click", ".btn-delete", handleDeleteTask);
  });
}

/**
 * Make items droppable
 * @param [string] items
 */
function makeDroppable(items) {
  items.forEach((item) => {
    let x = $(`#${item}`);
    x.droppable({
      hoverClass: "hovered",
      drop: handleDrop,
    });
  });
}
