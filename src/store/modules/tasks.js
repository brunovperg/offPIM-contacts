const tasks = {
    state: {
        tasksAggregate: {
            today:0,
            overdue:0,
            tomorrow:0,
            doneToday:0,
            initiated: false
        },
        statusColors: {
            cancelled:"error",
            wait:"secondary",
            plan:"secondary",
            todo:"primary",
            next:"warning",
            doing:"info",
            done:"success"
        },
        taskStatuses: {
            "plan":0,
            "wait":0,
            "next":0,
            "todo":0,
            "cancelled":0,
            "done":0,
            "doing":0
        },
        taskPriorities: {
            1:0,
            2:0,
            3:0,
            4:0
        },
        postponed: [],
        openProjects: []
    },
    mutations: {
        setTaskField (state, payload) {
            const index = state.data.findIndex( ({ _id }) => _id === payload._id );
            let task = state.data[index];
            task[payload.field] = payload.value;
            this.dispatch('insertDocument', { doc: task });
        },
        /* old couchdb-code. Moved to component taskitemsdates
        clearTaskDate (state, payload) {
            const index = state.data.findIndex( ({ _id }) => _id === payload._id );
            let task = state.data[index];
            task[payload.key] = null;
            this.dispatch('insertDocument', { doc: task });
        },
        
        setTaskTime (state, payload) {
            const index = state.data.findIndex( ({ _id }) => _id === payload._id );
            let task = state.data[index];
            let dateString = task[payload.key];
            if (typeof dateString == 'undefined') {
                let d = new Date();
                dateString = d.toISOString();
            }
            let newDate = new Date(dateString);
            let TZ = newDate.getTimezoneOffset() / 60;
            let h = parseInt( payload.value.slice(0,2) );
            newDate.setHours(h - TZ);
            newDate.setMinutes(payload.value.slice(3,5));
            newDate.setMilliseconds(0);
            newDate.setSeconds(0);
            task[payload.key] = newDate.toISOString();
            this.dispatch('insertDocument', { doc: task });
        },
        */
        /*
        setTaskDate (state, payload) {
            const index = state.data.findIndex( ({ _id }) => _id === payload._id );
            let task = state.data[index];
            task.postponed++;
            let dateString = task[payload.key];
            if (typeof dateString == 'undefined') {
                dateString = '2020-01-01T00:00:00.000Z';
            }
            let currentDate = new Date(dateString);
            let newDate = new Date(payload.value);
            currentDate.setFullYear(newDate.getFullYear());
            currentDate.setMonth(newDate.getMonth());
            currentDate.setDate(newDate.getDate());
            task[payload.key] = currentDate.toISOString();
            this.dispatch('insertDocument', { doc: task });
        },
        */

        /* moved to component
        setTaskStatus (state, payload) {
            //const index = this.getters.getDataItemIndex(payload._id);
            //const index = state.data.findIndex( ({ _id }) => _id === payload._id );
            let task = this.getters.getDataItem(payload._id);
            //let task = state.data[index];
            task.status = payload.status;
            if ( ['done','cancelled'].includes(payload.status) ) {
                task.end = new Date().toJSON();
            }
            let newPayload = { doc: task };
            this.dispatch('insertDocument', newPayload);
            setTimeout(()=>{
                this.dispatch('getTaskStatuses');
              }, 4000);
        },
        */
        setTaskStatuses (state, payload) {
            state.taskStatuses[payload.key] = payload.value;
        },
        setTaskPriorities (state, payload) {
            state.taskPriorities[payload.key] = payload.value;
        },
        addPostponed (state, payload) {
            state.postponed.push(payload)
        },
        setTasksAggregate (state, payload) {
            state.tasksAggregate[payload.key] = payload.value;
        },
        flushOpenProjects (state) {
            state.openProjects = []
        },
        addOpenProjects (state, payload) {
            state.openProjects = payload
        },
        
    },
    actions: {
        tasksDueAggregation: async function (context) {
            /*
            let mango = { selector: {
                productivity: true,
                    type: "task",
                    $nor: [
                        {status: "cancelled"},
                        {status: "done"},
                        {due: null}
                    ],
                },
                limit: 1000,
                fields: ["due"],
                use_index: "pimpim_mango_indexes"
            };
                Old code - for direct CouchDB CRUD
                let url = context.getters.urlMango;
                let data = await context.dispatch('postData', {url:url, data:mango} );
            */
            let aggregate = {
                today:0,
                tomorrow:0,
                overdue:0
            }

            let today = new Date();
            const todayDate = today.toISOString().slice(0,10);
            let tomorrowMilli = new Date().setDate(today.getDate() + 1);
            let tomorrow = new Date(tomorrowMilli);
            const tomorrowDate = tomorrow.toISOString().slice(0,10);
            let dayAfterTomorrowMilli = new Date().setDate(today.getDate() + 2);
            let dayAfterTomorrow = new Date(dayAfterTomorrowMilli);
            const dayAfterTomorrowDate = dayAfterTomorrow.toISOString().slice(0,10);

            let yesterdayMilli = new Date().setDate(today.getDate() - 1);
            let yesterday = new Date(yesterdayMilli);
            const yesterdayDate = yesterday.toISOString().slice(0,10);
            
            /*
            data.docs.forEach(doc => {
                if (doc.due > todayDate && doc.due < dayAfterTomorrowDate) {
                    aggregate.tomorrow++
                }
                if (doc.due < tomorrowDate) {
                    aggregate.today++
                }
                if (doc.due < todayDate) {
                    aggregate.overdue++
                }
            });
            */

            /*
            window.db.find(mango)
            .then(function (data) {

            }).catch(function (error) {
                
            });
            */

            try {
                let options = {
                    //startkey: startKey,
                    //endkey: endKey,
                    limit: 400, // consider controlling this value with vuex
                    //reduce: true,
                    group: true,
                    include_docs: false
                };
                let data = await window.db.query('pimpim/tasks-due', options);
                //let data = await window.db.find(mango);
                console.log('Fix this. Tasks aggregation DUE test: ',data);
                data.rows.forEach(doc => {
                    if (doc.key > todayDate && doc.key < dayAfterTomorrowDate) {
                        //aggregate.tomorrow++
                        aggregate.tomorrow += doc.value
                    }
                    //if (doc.key < tomorrowDate && doc.key ) {
                    if (doc.key.slice(0,10) == todayDate ) {
                        //aggregate.today++
                        //slice(0,10)
                        aggregate.today += doc.value
                    }
                    if (doc.key < todayDate) {
                        //aggregate.overdue++
                        aggregate.overdue += doc.value
                    }
                });
                /*
                data.rows.forEach(doc => {
                    if (doc.due > todayDate && doc.due < dayAfterTomorrowDate) {
                        aggregate.tomorrow++
                    }
                    if (doc.due < tomorrowDate) {
                        aggregate.today++
                    }
                    if (doc.due < todayDate) {
                        aggregate.overdue++
                    }
                });
                */
                context.commit('setTasksAggregate', { key: 'today', value: aggregate.today});
                context.commit('setTasksAggregate', { key: 'tomorrow', value: aggregate.tomorrow});
                context.commit('setTasksAggregate', { key: 'overdue', value: aggregate.overdue});
            } catch (error) {
                context.commit('addAlert', {type:'error',text:error})
            }

            // Prepares new mango query for tasks done today stats
            /*
            mango.selector["$nor"] = [
                {"status": "cancelled"},
                {"due": null}
            ]
            mango.selector.status = "done"
            mango.selector.end = {
                $gt: yesterdayDate,
                $lt: tomorrowDate
            }
            mango.fields = ["status"]
            */

            //let dataDoneToday = await context.dispatch('postData', {url:url, data:mango} );

            try {
                let options = {
                    startkey: yesterdayDate,
                    endkey: tomorrowDate,
                    limit: 400, // consider controlling this value with vuex
                    reduce: false,
                    include_docs: false
                };
                let data = await window.db.query('pimpim/tasks-done', options);
                //let data = await window.db.find(mango);
                console.log('Fix this. Tasks aggregation tasks done today test: ',data) //dataDoneToday
                //context.commit('setTasksAggregate', { key: 'doneToday', value: data.docs.length});
                context.commit('setTasksAggregate', { key: 'doneToday', value: data.rows.length});
                context.commit('setTasksAggregate', { key: 'initiated', value: true });
            } catch (err) {
                context.commit('addAlert', {type:'error',text:err})
            }
            return true
        },
        //async populateOpenProjects (context) {
        populateOpenProjects (context) {
            //let url = context.getters.urlMango;
            this.commit('flushOpenProjects');
            let mango = { selector: {
                productivity: true,
                    type: "project",
                    $nor: [
                        { status: "cancelled"},
                        { status: "done"}
                    ]
                    },
                limit: 100
                /*
                "sort": [ 
                    { "project": "asc" }
                ]
                */
            };

            window.db.find(mango)
            .then(function (result) {
                context.commit('addOpenProjects', result.docs)
            })
            .catch(function (err) {
                context.commit('addAlert', {type:'error',text:err})
            });

            /* Old code for CouchDB
            try {
                const response = await fetch(url, {
                    method: "POST",
                    body: JSON.stringify(mango), 
                    headers: {
                    "Content-Type": "application/json"
                    }
                });
                const result = await response.json();
                this.commit('addOpenProjects', await result.docs)
            } catch (error) {
                this.commit('addAlert', {type:'error',text:error})
            }
            */
        },
        //async getTaskStatuses (context) {
        async getTaskStatuses (context) {
            // count the pokemon whose names start with 'P'
            
            /*
            window.db.query('pimpim/task-status-count', {
                //key: 'P', 
                //reduce: true, 
                group: true
            }).then(function (data) {
                // handle result
                //console.log(result)
                data.rows.forEach( (aggregate) => {
                    context.commit('setTaskStatuses', aggregate)
                });
            }).catch(function (err) {
                context.commit('addAlert', {type:'error',text:err})
                // handle errors
            });
            */

            try {
                var result = await window.db.query('pimpim/task-status-count', {
                    group: true
                });
                result.rows.forEach( (aggregate) => {
                    context.commit('setTaskStatuses', aggregate)
                });
            } catch (err) {
                //context.commit('addAlert', {type:'error',text:err})
                console.log('Task status count index missing. If this is the first run. This is completely normal: ', err)
            }

            //db.query(fun, [options], [callback])

            /* old CouchDB code
            let url = context.getters.urlDB;
            const response = await fetch(url + `_design/pimpim/_view/task-status-count?group=true`)
            const result = await response.json();
            result.rows.forEach( (aggregate) => {
                context.commit('setTaskStatuses', aggregate)
            });
            */
        },
        getTaskPriorities (context) {
            window.db.query('pimpim/task-priority-count', {
                group: true
            }).then(function (data) {
                data.rows.forEach( (aggregate) => {
                    context.commit('setTaskPriorities', aggregate)
                });
            }).catch(function (err) {
                context.commit('addAlert', {type:'error',text:err})
            });
            /*
            let url = context.getters.urlDB;
            fetch(url + `_design/pimpim/_view/task-priority-count?group=true`)
            .then((resp) => resp.json())
            .then(function(data) {
                data.rows.forEach( (aggregate) => {
                    context.commit('setTaskPriorities', aggregate)
                });
            });
            */
        },
        getTasks (context, payload) {
            let list = payload;
            //let vstore = this;
            //let url = context.getters.urlMango;
            //this.commit('flushTasks');
            context.commit('toggleLoader');
            let mango = { selector: {
                productivity: true,
                        type: "task",
                        },
                    limit: 50
                    //"use_index": "pimpim_mango_indexes"
                    /*
                    "sort": [
                        { "due": "asc" },
                        { "priority": "asc" }
                    ]
                    */
                    };
            if (list.slice(0,6) == "status") {
                mango.selector.status = list.slice(6);
            } else if (list.slice(0,7) == "project") {
                mango.selector["$nor"] = [
                    {"status": "cancelled"},
                    {"status": "done"}
                ];
                mango.selector.project = list.slice(7);
            } else if (list.slice(0,8) == "priority") {
                mango.selector["$nor"] = [
                    {"status": "cancelled"},
                    {"status": "done"}
                ];
                const pri = list.slice(8);
                mango.selector.priority = parseInt(pri);
            } else if (list.slice(0,11) == "postponed5x") {
                mango.selector["$nor"] = [
                    {"status": "cancelled"},
                    {"status": "done"}
                ];
                mango.selector.postponed = {"$gt": 5};
            } else if (list.slice(0,8) == "tomorrow") {
                mango.selector["$nor"] = [
                    {"status": "cancelled"},
                    {"status": "done"},
                    {"due": null}
                ];
                let today = new Date();
                let dayAfterTomorrowMilli = new Date().setDate(today.getDate() + 2);
                let dayAfterTomorrow = new Date(dayAfterTomorrowMilli);
                mango.selector.due = {
                    "$gt": today.toISOString().slice(0,10),
                    "$lt": dayAfterTomorrow.toISOString().slice(0,10)
                 };
            } else {
                mango.selector["$nor"] = [
                    {"status": "cancelled"},
                    {"status": "done"},
                    {"due": null}
                ];
                let d = new Date();
                d.setDate(d.getDate() + 1);
                mango.selector.due = {"$lt": d.toISOString().slice(0,10)};
            }

            window.db.find(mango)
            .then(function (data) {
                //context.commit('addTasks', data)
                context.commit('addDataArray', data.docs)                
                /*
                data.docs.forEach( (doc, index) => {
                    context.commit('addTask', doc)
                    if (index + 1 == data.docs.length) {
                        context.commit('toggleLoader');
                    }
                });
                if (data.docs.length == 0) {context.commit('toggleLoader');}
                */
            }).catch(function (error) {
                context.commit('toggleLoader');
                context.commit('addAlert', {type:'error',text: error})
            });

            /*
            window.db.explain(mango)
            .then(function (explained) {
                console.log(explained)
            // detailed explained info can be viewed
            });
            */

            /* old CouchDB code
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(mango)
            })
            .then((resp) => resp.json())
            .then(function(dbData) {
                dbData.docs.forEach( (doc, index) => {
                    vstore.commit('addTask', doc)
                    if (index + 1 == dbData.docs.length) {
                        vstore.commit('toggleLoader');
                    }
                });
                if (dbData.docs.length == 0) {vstore.commit('toggleLoader');}
            })
            .catch(function(error) {
                this.commit('toggleLoader');
                this.commit('addAlert', {type:'error',text: error})
            });
            */
        },
        getTasksTagList: async function (context) {
            //let url = context.getters.urlDB;
            //const response = await fetch(url + '/_design/pimpim/_view/messages-tag-count?group=true');
            //context.commit('setTagList', await response.json())
            try {
                const result = await window.db.query('pimpim/tasks-tag-count', {
                    group: true
                });
                context.commit('setTagList', result)
                //result.rows.forEach( (aggregate) => {
                //    context.commit('setTaskStatuses', aggregate)
                //});
            } catch (err) {
                context.commit('addAlert', {type:'error',text:err})
            }

        }
    },
    getters: {
        getOpenProjects: state => {
            return state.openProjects
        },
        /*
        getTask: (state) => (id) => {
            return state.data.find(task => task._id === id)
        },
        */        
        getTaskStatus: (state) => (id) => {
            console.log(state)
            let task = state.data.find(task => task._id === id)
            return task.status
        },
        /*
        getTasks: state => {
            return state.data
        },
        */
        getTaskStatuses: state => {
            return state.taskStatuses
        },
        getTaskPriorities: state => {
            return state.taskPriorities
        },
        getPostponedTasks: state => {
            return state.postponed
        },
        /*
        countDisplayedTasks: state => {
            return state.data.length
        },
        */
        getTasksAggregate: state => {
            return state.tasksAggregate
        },
        /*
        getTasksTagsList: state => {
            return state.tagsList
        },
        */
        getStatusColors: state => {
            return state.statusColors
        },
    },
}

export default tasks