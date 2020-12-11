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

    is_board_element_blocked(board_element) {
        return this.blocked_board_elements.includes(board_element);
    }

    is_board_element_voted(board_element) {
        return this.current_voted_elements.includes(board_element);
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

                if (person.is_board_element_blocked(board_element)) {
                    document.getElementById(id).querySelector("div").disabled = true;
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

            document.getElementById(id).querySelector(".summary-possibility").innerText = poss;
        }
    }

    static disable_end_vote() {
        document.getElementById("end-vote-btn").disabled = true;

    }

    static enable_end_vote() {
        document.getElementById("end-vote-btn").disabled = false;
    }

    static unlock_buttons() {
        for (let i = 0; i < BoardPersons.length; i++) {
            for (let j = 0; j < BoardElements.length; j++) {
                let person_name = BoardPersons[i];
                let board_element = BoardElements[j];

                let id = Person.get_id(person_name, board_element);
                document.getElementById(id).querySelector(".vote").disabled = false;
            }
        }
    }

    static add_board_element_to_vote_button(board_element) {
        let button = document.getElementById("end-vote-btn");
        if (button.innerText == "End Vote") {
            button.innerText += " (" + board_element + ")";
        } else {
            button.innerText = button.innerText.slice(0, button.innerText.length - 1) + ", " + board_element + ")";
        }
    }

    static clear_vote_button(board_element) {
        document.getElementById("end-vote-btn").innerText = "End Vote";
    }

    static block_element(board_element) {
        let id = BoardElements.findIndex((val) => val == board_element);
        let elem = document.querySelectorAll(".board-element-name")[id];
        elem.parentElement.parentElement.style.opacity = "0.1";

        for (let i = 0; i < BoardPersons.length; i++) {
            _global_persons[BoardPersons[i]].block_board_element(board_element);
        }

        Interface.update()
    }
}

function block_board_element(elem) {
    let board_element = elem.parentElement.querySelector(".board-element-name").innerText;
    Interface.block_element(board_element);
}

function vote(person_id, elem) {
    let board_element = elem.parentElement.parentElement.querySelector(".board-element-name").innerText;
    
    if (_global_persons[BoardPersons[person_id]].is_board_element_blocked(board_element))
        return;

    if (_global_persons[BoardPersons[person_id]].is_board_element_voted(board_element))
        return;
    
    if (_global_current_voted_person == null) {
        _global_current_voted_person = BoardPersons[person_id];
    } else {
        if (BoardPersons[person_id] != _global_current_voted_person)
            return;
    }

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


window.onload = function() {
    let template = document.getElementsByTagName("template")[0];
    let table = document.getElementById("container");

    for (let i = 0; i < BoardElements.length; i++) {
        const board_element = BoardElements[i];
        let elem = template.content.cloneNode(true);
        elem.querySelector(".board-element-name").innerText = board_element;
        elem.querySelector(".board-element").id = BoardElement.get_id(board_element);

        let votes = elem.querySelectorAll(".vote-container");

        for (let j = 0; j < votes.length; j++) {
            let id = Person.get_id(
                BoardPersons[j], BoardElements[i]
            );
            votes[j].id = id;
        }

        table.appendChild(elem);
    }

    template.remove();

    _global_persons = create_persons();
};