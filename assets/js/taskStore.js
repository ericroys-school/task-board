
const TASK = "taskEntries";

export const TITLE = "taskTitle";
export const DUEDATE = "taskDueDate";
export const DESCRIPTION = "taskDescription";
export const STATE = "state";
export const ID = "taskId";
export const STATEVAL = {
   TODO:"Not Yet Started",
   WIP: "In Progress",
   COMPLETE: "Completed"
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
    console.log("*****" + store.length)
    return store ? JSON.parse(store) : [];
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