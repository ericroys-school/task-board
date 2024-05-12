import { DESCRIPTION, DUEDATE, TITLE, getStorageEntries, setStorageEntries } from "./taskStore.js";

// Retrieve tasks and nextId from localStorage
let taskList = getStorageEntries();
let nextId = JSON.parse(localStorage.getItem("nextId"));

/* a mapping between our task model key and the form input id 
   note: technically they are same at this point, but if key on 
   either side changes, it's simply enough to remap here
*/
const kvMapping = {};
kvMapping[TITLE] = TITLE;
kvMapping[DUEDATE] = DUEDATE;
kvMapping[DESCRIPTION] = DESCRIPTION;

// Todo: create a function to generate a unique task id
//(see taskStore.js)

// Todo: create a function to create a task card
function createTaskCard(task) {
 if(!task)
    return null;

const card = (`<div class="card"">
<div class="card-body">
  <h5 class="card-title">${task[TITLE]}</h5>
  <h6 class="card-subtitle mb-2 text-muted">${task[DUEDATE]}</h6>
  <p class="card-text">${task[DESCRIPTION]}</p>
</div>
</div>
`)
return card;
}



// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    taskList.forEach(t => {
        let card = null;
        if(card = createTaskCard(t)){
            $("todo-cards").append(card);
        }
    });
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
      } 
      /* add fail-safe validation of the date. Technically
                   though the input is set as read-only and user can only 
                   select date from date-picker
                */
      else {
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
  if(!validateAddTask(formInputs))
    return;
  //build object
  const task = { };
  formInputs.each(function () {
    task[kvMapping[$(this).attr("id")]] = $(this).val();
    //clear the entry while we are at it
    $(this).val("");
  })
  console.log(JSON.stringify(event))
  //send to storage
  setStorageEntries(task);

  //close the modal
  $("#createTaskModal").modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {}

// Todo: when the page loads, render the task list,
//add event listeners, make lanes droppable,
//and make the due date field a date picker
$(document).ready(function () {
  // add date picker
  $("#taskDueDate").datepicker();
  //add listener to addTask button
  $("#btnAddTask").on("click", handleAddTask);


});
