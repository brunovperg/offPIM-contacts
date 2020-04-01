/* Not in use. Will be removed
var pimpimSettings = {
    "database":"vault",
    "dbBasePath": "http://localhost:5984/"
};
*/

window.pimpim.pimpimDesignDoc = {
  "_id": "_design/pimpim",
  "version": 20200330,
  "views": {
    "messages-tag-count": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.message) {\n    function emitTag(tag) {\n        emit(tag);\n    }\n    doc.tags.forEach(emitTag);\n    if (doc.tags.length == 0) {\n      emit(\"untagged\");\n    }\n  }\n}"
    },
    "logs-tag-count": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.logbook) {\n    function emitTag(tag) {\n        emit(tag);\n    }\n    doc.tags.forEach(emitTag);\n    if (doc.tags.length == 0) {\n      emit(\"untagged\");\n    }\n  }\n}"
    },
    "note-tag-count": {
      "reduce": "_count",
      "map": "function (doc) {\n  //if (doc.productivity && doc.type == \"note\" && doc.archived != true) {\n  if (doc.productivity && doc.type == \"note\") {\n    //emit(doc.tags, 1);\n    function emitTag(tag) {\n        emit(tag);\n        //emit(tag, 1);\n        //emit(tag, tag);\n    }\n    //doc.tags && doc.tags.forEach(emitTag);\n    doc.tags.forEach(emitTag);\n    if (doc.tags.length == 0) {\n      emit(\"No tag\");\n      //emit(\"No tag\", 1);\n    }\n  }\n}"
    },
    "task-status-count": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.productivity && doc.type == \"task\") {\n    emit(doc.status);\n  }\n}"
    },
    "totals": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.message) {\n    emit(\"messages\");\n  }\n  if (doc.logbook) {\n    emit(\"logs\");\n  }\n  if (doc.productivity && doc.type == \"task\") {\n    emit(\"tasks\");\n  }\n}"
    },
    "task-priority-count": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.productivity && doc.type == \"task\" && doc.status != 'done' && doc.status != 'cancelled') {\n    emit(doc.priority);\n  }\n}"
    },
    "logs-start-months": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.logbook) {\n    var d = doc.start.slice(0,4);\n    var m = doc.start.slice(5,7);\n    var x = d + '-' + m;\n    emit(x);\n  }\n}"
    },
    "logs-start-years": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.logbook) {\n    var d = doc.start.slice(0,4);\n    emit(d);\n  }\n}"
    },
    "logs-start-days": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.logbook) {\n    var y = doc.start.slice(0,4);\n    var m = doc.start.slice(5,7);\n    var d = doc.start.slice(8,10);\n    var x = [y, m, d].join('-');\n    emit(x);\n  }\n}"
    },
    "finance-totals-sum": {
      "reduce": "_sum",
      "map": "function (doc) {\n  \n  if (doc.finance) {\n    if (doc.balance) {\n      emit(\"valueAccounts\", doc.balance);\n    }\n  }\n}"
    },
    "tasks-tag-count": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.productivity && doc.type == \"task\") {\n    function emitTag(tag) {\n        emit(tag);\n    }\n    doc.tags.forEach(emitTag);\n    if (doc.tags.length == 0) {\n      emit(\"untagged\");\n    }\n  }\n}"
    },
    "tasks-due": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.productivity \n      && doc.due \n      && doc.type === \"task\" \n      && doc.status != 'done' \n      && doc.status != 'cancelled') {\n    emit(doc.due);\n  }\n}"
    },
    "tasks-done": {
      "reduce": "_count",
      "map": "function (doc) {\n  if (doc.productivity \n      && doc.type === \"task\" \n      && doc.status === 'done') {\n    emit(doc.end);\n  }\n}"
    }
  },
  "language": "javascript"
}