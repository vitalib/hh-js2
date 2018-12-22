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
                                    event.light.transition("SWITCH_ON");
                                    setState("opened");
                                    setContext({opened: true});
                                    return "ok";
                                })
                        }
                    }
                },
                onExit:[() => console.log("door starts to open"), "onDoorClose"]
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
                            event.light.transition("SWITCH_OFF");
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
            },
             onDoorClose: function(event) {
                const [state, _] = useState();
                console.log("Now door is " + state);
            }
        },
    })
    let machine2 = machine({
        id: 2,
        context: {power: 20, counter: 0},
        initialState: "off",
        states: {
            "off": {
                onEntry() {
                    console.log("becomes dark")
                },
                on: {
                    "SWITCH_ON": {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            Promise.resolve("Switching on light")
                                .then((result) => {
                                    console.log(result)
                                    setState("on");
                                })
                        }
                    }
                },
                onExit() {
                    console.log("click of switcher of");
                }
            },
            "on": {
                onEntry() {
                    console.log("click of switcher on")
                },
                on: {
                    "SWITCH_OFF": {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            Promise.resolve("Switching of light")
                                .then((result) => {
                                    console.log(result)
                                    setState("off");
                                })
                        },
                    }
                },
                onExit() {
                    console.log("dark comes");
                },
            },
        },
        actions: {}
    })

    function assertEqual(val1, val2) {
        if (val1 != val2) {
            throw new Error(val1 + " != " + val2)
        }
    }
    machine1.transition("OPEN", {light: machine2});
    setTimeout(() => machine1.transition("CLOSE",  {light: machine2}), 0);
    setTimeout(() => machine1.transition("OPEN",  {light: machine2}), 0);
    // new Promise((resolve) =>{
    //     assertEqual("closed", machine1.currentState); resolve("ok")})
    //     .then(() => machine1.transition("OPEN", {light: machine2}))
    //     .then((aMachine) => {assertEqual("opened", aMachine.currentState)})
    //     .then(() => machine1.transition("CLOSE", {closer: {name: "Goga", age: 13}}))
    //     .then((aMachine) => assertEqual("closed", aMachine.currentState))
    //     .then(() => machine1.transition("OPEN", {opener: {name: "Vera", age: 62}}))
    //     .then((aMachine) => assertEqual("opened", aMachine.currentState))
})()



