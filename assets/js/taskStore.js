const TASK = "taskEntries";

export const TITLE = "taskTitle";
export const DUEDATE = "taskDueDate";
export const DESCRIPTION = "taskDescription";
export const STATE = "state";
export const ID = "taskId";
export const STATEVAL = {
  TODO: "Not Yet Started",
  WIP: "In Progress",
  COMPLETE: "Completed",
};

function generateTaskId() {
  // generate a UUID as an id
  return crypto.randomUUID();
}

/**
 * get the task entry array from local storage or create an empty one
 * @returns [{TITLE:"", DUEDATE:"", DESCRIPTION:"", STATE: "", ID: ""}] or empty array
 */
export function getListEntries() {
  let store = localStorage.getItem(TASK);
  return store ? JSON.parse(store) : [];
}

/**
 * Get an entry from local storage
 * @param {*} id the id of the task to get
 * @returns task or null if none found
 */
export function getEntry(id) {
  let f = getListEntries().find((t) => id === t[ID]);
  return f ? f : null;
}

/**
 * Set status for a task
 * @param string id
 * @param STATEVAL status
 */
export function setStatus(id, status) {
  if (!id || !status) return;
  let f = getEntry(id);
  if (!f) return;

  f[STATE] = status;
  setEntry(id, f);
}

/**
 * Updates an entry to local storage
 * @param {*} id the id to update
 * @param {*} task the updated task
 * @returns
 */
export function setEntry(id, task) {
  if ((!id) || (!task)) return false;
  
  //get existing array to append
  let store = getListEntries();
  //get index of our task
  let i = store.findIndex((a) => id === a[ID]);
  if (i > -1) {
    //update the props with updatables
    store[i] = { ...store[i], ...task };
    //stick it back in storage
    localStorage.setItem(TASK, JSON.stringify(store));
    return true;
  }
  return false;
}

/**
 * Delete an entry from storage
 * @param string id 
 * @returns true if done otherwise false
 */
export function deleteEntry(id) {
  if (!id || !getEntry(id)) return false;
  //get existing array to append
  let store = getListEntries();
  //get index of our task
  store = store.filter((a) => id !== a[ID]);
  localStorage.setItem(TASK, JSON.stringify(store));
  return true;
}

/**
 * write the new item to the local storage for taskEntries
 * @param {TITLE:"", DUEDATE:"", DESCRIPTION:""} posting
 */
export function createEntry(posting) {
  if (posting) {
    //set id and initial state which would normally be set
    //by api or database layer
    posting[ID] = generateTaskId();
    posting[STATE] = STATEVAL.TODO;

    //store date as epoch
    posting[DUEDATE] = dayjs(posting[DUEDATE]).valueOf();

    //get existing array to append
    let store = getListEntries();
    store.push(posting);
    localStorage.setItem(TASK, JSON.stringify(store));
  }
}
