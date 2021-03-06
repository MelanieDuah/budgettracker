let db;
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
  const db = target.result;
  const objectStore = db.createObjectStore("pending", { autoIncrement: true });
  objectStore.createIndex("pending", "pending");
};


request.onsuccess = function (event) {
  db =event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (event) => {
  console.log("error" + event.target.errorCode);
}

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");
  const getAll = store.getAll();
 
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
          
        });
    }
  };
}

window.addEventListener("online", checkDatabase);