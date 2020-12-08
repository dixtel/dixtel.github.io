const BoardElements = [
    "Ivasqu",
    "Florentina",
    "Victor",
    "Balan",
    "Ana",
    "Cantemir",
    "Nóż",
    "Świecznik",
    "Rewolwer",
    "Lina",
    "Rura",
    "Klucz",
    "Dziedziniec",
    "Piwnica",
    "Biblioteka",
    "Salon",
    "Las",
    "Cmentarz",
    "Klatka Schodowa",
    "Taras Widokowy",
    "Sypialnia"
];

const BoardPersons = [
    "Ivasqu",
    "Florentina",
    "Victor",
    "Balan",
    "Ana",
    "Cantemir",
]

let _global_persons = {};
let _global_current_voted_person = null;

class Person {
    constructor(name) {
        this.name = name;
        this.elements = [...BoardElements];
        this.possibility = {};
        this.rounds = 0;
        this.blocked_board_elements = [];
        this.current_voted_elements = [];

        for (let i = 0; i < BoardElements.length; i++) {
            this.possibility[BoardElements[i]] = 0;
        }
    }

    vote(board_element) {
        this.current_voted_elements.push(board_element);
    }

    end_vote() {
        for (let i = 0; i < this.current_voted_elements.length; i++) {
            this.possibility[this.current_voted_elements[i]] += 1 / this.current_voted_elements.length;

        }
        this.rounds += 1;
        this.current_voted_elements = [];
    }

    block_board_element(board_element) {
        this.blocked_board_elements.push(board_element);
    }

    get_possibility(board_element) {
        return this.possibility[board_element];
    }

    is_board_elemtn_blocked(board_element) {
        return this.blocked_board_elements.includes(board_element);
    }

    static get_id(person_name, board_element) {
        return board_element.toLowerCase() + "-" + person_name.toLowerCase();
    }
}

class BoardElement {

    static get_id(board_element) {
        return board_element.toLowerCase() + "-board-element";
    }

    static get_summary_possibility(board_element) {
        let res = 0;
        for (let i = 0; i < BoardPersons.length; i++) {
            res += _global_persons[BoardPersons[i]].get_possibility(board_element);
        }

        return res;
    }
}

class Interface {
    static update() {
        for (let i = 0; i < BoardPersons.length; i++) {
            for (let j = 0; j < BoardElements.length; j++) {
                let person_name = BoardPersons[i];
                let board_element = BoardElements[j];
                let person = _global_persons[person_name];
                let id = Person.get_id(person_name, board_element);

                let poss = person.get_possibility(board_element);
                if (poss == 0)
                    poss = "0";
                else
                    poss = poss.toFixed(2);

                document.getElementById(id).querySelector("div").innerText = poss;

                if (person.is_board_elemtn_blocked(board_element)) {
                    document.getElementById(id).querySelector("button").disabled = true;
                }
            }
        }

        Interface.update_summary_possibility();
    }

    static update_summary_possibility() {
        for (let i = 0; i < BoardElements.length; i++) {
            let id = BoardElement.get_id(BoardElements[i]);
            let poss = BoardElement.get_summary_possibility(BoardElements[i]);
            if (poss == 0)
                poss = "0";
            else
                poss = poss.toFixed(2);

            document.getElementById(id).querySelectorAll("div")[1].innerText = poss;
        }
    }

    static disable_end_vote() {
        document.getElementById("end-vote").disabled = true;

    }

    static enable_end_vote() {
        document.getElementById("end-vote").disabled = false;
    }

    static unlock_buttons() {
        for (let i = 0; i < BoardPersons.length; i++) {
            for (let j = 0; j < BoardElements.length; j++) {
                let person_name = BoardPersons[i];
                let board_element = BoardElements[j];

                let id = Person.get_id(person_name, board_element);
                document.getElementById(id).querySelector("button").disabled = false;
            }
        }
    }

    static add_board_element_to_vote_button(board_element) {
        let button = document.getElementById("end-vote");
        if (button.innerText == "End Vote") {
            button.innerText += " (" + board_element + ")";
        }
        else {
            button.innerText = button.innerText.slice(0, button.innerText.length - 1) + ", " + board_element + ")";
        }
    }

    static clear_vote_button(board_element) {
        document.getElementById("end-vote").innerText = "End Vote";
    }

    static block_element(board_element) {
        let id = BoardElements.findIndex((val) => val == board_element);
        let elem = document.querySelectorAll(".board_element_name")[id];
        elem.parentElement.parentElement.style.opacity = "0.7";

        for (let i = 0; i < BoardPersons.length; i++) {
            _global_persons[BoardPersons[i]].block_board_element(board_element);
        }

        Interface.update()
    }
}

function block_board_element(elem) {
    let board_element = elem.parentElement.querySelector("div").innerText;
    Interface.block_element(board_element);
}

function vote(person_id, elem) {
    if (_global_current_voted_person == null) {
        _global_current_voted_person = BoardPersons[person_id];
    }
    else {
        if (BoardPersons[person_id] != _global_current_voted_person)
            return;
    }

    let board_element = elem.parentElement.parentElement.getElementsByClassName("board_element_name")[0].innerText;
    _global_persons[BoardPersons[person_id]].vote(board_element);
    elem.disabled = true;
    Interface.enable_end_vote();
    Interface.add_board_element_to_vote_button(board_element);
}

function end_vote() {
    _global_persons[_global_current_voted_person].end_vote();

    Interface.disable_end_vote();
    Interface.unlock_buttons();
    Interface.update();
    Interface.clear_vote_button();

    _global_current_voted_person = null;
}

function create_persons() {
    let persons = {};
    for (let i = 0; i < BoardPersons.length; i++) {
        persons[BoardPersons[i]] = new Person(BoardPersons[i]);
    }
    return persons;
}


window.onload = function () {
    let template = document.getElementsByTagName("template")[0];
    let table = document.getElementById("table").querySelector("tbody");

    for (let i = 0; i < BoardElements.length; i++) {
        const board_element = BoardElements[i];
        let elem = template.content.cloneNode(true);
        elem.querySelector("td").querySelector(".board_element_name").innerText = board_element;

        let elem_persons = elem.querySelectorAll("td");

        elem_persons[0].id = BoardElement.get_id(board_element);

        for (let j = 1; j < elem_persons.length; j++) {
            let id = Person.get_id(
                BoardPersons[j - 1], BoardElements[i]
            );
            elem_persons[j].id = id;
        }

        table.appendChild(elem);
    }


    _global_persons = create_persons();
};
