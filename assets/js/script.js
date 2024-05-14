import {
  DESCRIPTION,
  DUEDATE,
  STATE,
  STATEVAL,
  TITLE,
  ID,
  getStorageEntries,
  setStorageEntries,
} from "./taskStore.js";

//moved this into the list render function where it is better because it is
//encapsulated where it needs to be
// let taskList = getStorageEntries();

// Retrieve tasks and nextId from localStorage
let nextId = JSON.parse(localStorage.getItem("nextId"));

/* a mapping between our task model key and the form input id 
   note: technically they are same at this point, but if key on 
   either side changes, it's simply enough to remap here
*/
const kvMapping = {};
kvMapping[TITLE] = TITLE;
kvMapping[DUEDATE] = DUEDATE;
kvMapping[DESCRIPTION] = DESCRIPTION;

//moved this into taskStore.js as it should really be a
// function bundled with other storage function (see taskStore.js)

/**
 * Create a task card
 * @param {*} task a task data object
 * @param {*} state a css class to associate for colorings
 * @returns
 */
function createTaskCard(task, state) {
  if (!task) return null;

  //default to late if not provided since it will draw most attention
  const c = !state ? "card-late" : state;

  const card = $(`
  <div class="card ${c} task-draggable" id="${task[ID]}">
  <div class="card-body">
  <h5 class="card-title">${task[TITLE]}</h5>
  <h6 class="card-subtitle mb-2 text-muted">${dayjs(
    dayjs(task[DUEDATE])
  ).format("MM/DD/YYYY")}</h6>
  <p class="card-text">${task[DESCRIPTION]}</p>
  </div>
  </div>
`).data('text', `${task[ID]}`)
.draggable({
  cursor: 'move'
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
    return "card-late";
  /* if completed or is a future date */ else if (
    state === STATEVAL.COMPLETE ||
    dayjs().valueOf() - timein < 0
  )
    return "card-good";
  /* within a day window */ else return "card-warn";
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const taskList = getStorageEntries();

  if (!taskList || taskList.length < 1) return;

  //map state to the container
  const stateMap = {};
  stateMap[STATEVAL.TODO] = "#todo-cards"; // $("#todo-cards");
  stateMap[STATEVAL.WIP] = "#in-progress-cards"; //$("#in-progress-cards");
  stateMap[STATEVAL.COMPLETE] = "#done-cards"; // $("#done-cards");

  taskList.forEach((t) => {
    let card = null;

    //create a card and append to appropriate swim lane with appropriate state
    //colorings
    if ((card = createTaskCard(t, getCardStatus(t[STATE], t[DUEDATE])))) {
      //make it only appendable to appropriate next state
      //create in appropriate container
      $(stateMap[t[STATE]]).append(card);
    }
  });
}

function handleStartDrag(event) {
  // let tid = event.target.id;
  // event.originalEvent.dataTransfer.setData("text", tid);
  // console.log(tid);
}

/**
 * Sets the css for an element to 'is-invalid'
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
  setStorageEntries(task);

  //close the modal
  $("#createTaskModal").modal("hide");

  //refresh the list from storage
  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let a = event.target.id;
  let b = ui.draggable.data('text');
  console.log("A: " + a + "    B: " + b);
  let x = $(`#${a}`);
  let y = $(`#${b}`);
  y.removeAttr("style");
  x.append(y);
  

    console.log("****")
    ui.draggable.draggable('disable');
    //a.droppable('disable');
  
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
  //makeme();
});

$("#x").droppable({
  hoverClass: 'hovered',
  drop: handleDrop
});

// $("#x").droppable();
// $("#x").on("dragover", function (event) {
//   event.preventDefault();
//   console.log("DRAGGOVER");
// });

function makeme(){
  let card = $(`<div><p>UGHTHSH</div>`)
  .data("text", "1234")
  .attr('id', "1234").appendTo("#todo-cards")
  .draggable({
    cursor: 'move',
    //revert: true
  }) ;


//  $("#todo-cards").append(card);

}

// $(document).on("drop", "#x", function (event, i){

//   console.log("DROPPING");
//   console.log(event);
//   console.log("DATA: " + event.originalEvent.target.id);

//   console.log(event);
//   const taskId = event.originalEvent.target.id;
//   let c = $(`#${taskId}`);
//   c.removeAttr("style");
//   let id = event.currentTarget.id;
//   $(`#${id}`).append(c);
//   // let tid = event.originalEvent.target.id;
//   // if (!tid || tid === "") return;
//   // console.log("TID: " + tid);
//   // let c = $(`#${tid}`);
//   // //found an instance where style was added that put the component
//   // //off screen, so just adding a fail-safe
//   // c.removeAttr("style");
//   // let id = event.currentTarget.id;
//   // if (!id || id === "") return;
//   // $(`${id}`).append(c);
// });
// // $(document).on("drop", "#in-progress-cards", handleDrop);
