const {machine, useContext, useState} = require("./StateMachine");


(function test() {
    let machine1 = machine({
        id: 1,
        context: {color: 'white'},
        initialState: "closed",
        states: {
            "closed": {
                onEntry: ["onDoorOpen"],
                on: {
                    "OPEN": {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            Promise.resolve("Async openning door")
                                .then((result) => {
                                    console.log(result)
                                    setState("opened");
                                    setContext({opened: true});
                                })
                        }
                    }
                },
                onExit() {
                    console.log("door starts to open");
                }
            },
            "opened": {
                onEntry() {
                    console.log("door open")
                },
                on: {
                    "CLOSE": {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            Promise.resolve("async closing door")
                                .then((result) => {
                                    console.log(result)
                                    setState("closed");
                                    setContext({opened: false})
                                })
                        },
                    }
                },
                onExit() {
                    console.log("door starts to close");
                },
            },
        },
        actions: {
            onDoorOpen: function(event) {
                const [state, _] = useState();
                console.log("Now door is " + state);
            }
        },
    })

    function assertEqual(val1, val2) {
        if (val1 != val2) {
            throw new Error(val1 + " != " + val2)
        }
    }

    new Promise((resolve) =>{
        assertEqual("closed", machine1.currentState); resolve()})
        .then(() => machine1.transition("OPEN", {opener: {name: "Vitali", age: 20}}))
        .then((aMachine) => assertEqual("opened", aMachine.currentState))
        .then(() => machine1.transition("CLOSE", {closer: {name: "Goga", age: 13}}))
        .then((aMachine) => assertEqual("closed", aMachine.currentState))
        .then((result) => console.log(result))
        .then(() => machine1.transition("OPEN", {opener: {name: "Vera", age: 62}}))
        .then((result) => assertEqual("opened", machine1.currentState))
})()



