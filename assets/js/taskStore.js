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
export function getStorageEntries() {
  let store = localStorage.getItem(TASK);
  return store ? JSON.parse(store) : [];
}

/**
 * Get an entry from local storage
 * @param {*} id the id of the task to get
 * @returns task or null if none found
 */
export function getEntry(id) {
  let f = getStorageEntries().find((t) => id === t[ID]);
  return f ? f : null;
}

export function setStatus(id, status){

  if((!id) || (!status)) return;
  let f = getEntry(id);
  if(!f) return;
  
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
  if (!getEntry(id)) {
    console.log(`warn: unable to find ${id} in storage`);
    return false;
  }
  //get existing array to append
  let store = getStorageEntries();
  let i = store.findIndex((a) => id === a[ID]);
  if (i > -1) {
    store[i] = { ...store[i], ...task };
    localStorage.setItem(TASK, JSON.stringify(store));
    return true;
  }
  return false;
}

/**
 * write the new item to the local storage for taskEntries
 * @param {TITLE:"", DUEDATE:"", DESCRIPTION:""} posting
 */
export function setStorageEntries(posting) {
  if (posting) {
    //set id and initial state which would normally be set
    //by api or database layer
    posting[ID] = generateTaskId();
    posting[STATE] = STATEVAL.TODO;

    //store date as epoch
    posting[DUEDATE] = dayjs(posting[DUEDATE]).valueOf();

    //get existing array to append
    let store = getStorageEntries();
    store.push(posting);
    localStorage.setItem(TASK, JSON.stringify(store));
  }
}
