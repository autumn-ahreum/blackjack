"use strict";

// Get html elements
const startSection = document.querySelector(".start-section");
const gameSection = document.querySelector(".game");
const dealerSumSection = document.querySelector(".dealer-sum")
const playerSumSection = document.querySelector(".palyer-sum");
const restartSection = document.querySelector(".restart-section")
const dealerCardsContainer = document.getElementById("dealer-cards-container");
const playerCardsContainer = document .getElementById("player-cards-container");
const startBtn = document.getElementById("start-button");
const hitBtn = document.querySelector(".hit");
const standBtn = document.querySelector(".stand");
const restartBtn = document.querySelector(".restart");
const resultline = document.querySelector(".result-line p");
const loadingBox = document.querySelector(".loading-box");

class Card {
    constructor(name, value, color){
        this.name = name; // A♤ what is shown in UI
        this.value = value; // numeric value used in calculating sum
        this.color = color;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const card = document.createElement("div");
        card.classList.add("card");
        card.classList.add(this.color);
        card.style.zIndex = "1";

        card.innerHTML = 
            `<div id="${this.name}" class="card-face card-front">
                <div class="top-left">
                    <div class="card-value"> ${this.name[0]}</div>
                    <div class="card-suit">${this.name[1]}</div>
                </div>
                <div class="center-value">
                    <span class="card-suit">${this.name[1]}</span>
                </div>
            </div>
            <div class="card-face card-back"></div>
            `;

        card.children[1].style.marginLeft = "0";

        return card;
    }
}

class Game {
    constructor() {
        this.dealerCards = [];
        this.playerCards = [];
        this.dealerSum = 0;
        this.playerSum = 0;
    }
}

const DEC = ["ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "jc", "qc","kc","as","2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "js", "qs","ks","ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "jd", "qd","kd","ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "jh", "qh","kh"];
const CONTINUE = "continue";

let game;
let card; 
let cardIndex;
let resultMsg = CONTINUE;

startBtn.addEventListener('click', startGame);

function startGame() {
    startSection.style.display = "none";
    gameSection.style.display= "block";
    loadingBox.style.display= "none";
    gameStart();
}

function gameStart(){
    resetUiState();

    shuffle(DEC);
    game = new Game();

    // Player gets two cards 
    game.playerCards.push(getOneCard());
    game.playerCards.push(getOneCard());

    // Dealer gets two cards 
    game.dealerCards.push(getOneCard());
    game.dealerCards.push(getOneCard());

    // Player card UI
    game.playerCards.forEach(element => {
        renderCard(element, "player");
    });

    // Dealer card UI
    game.dealerCards.forEach(element => {
        renderCard(element, "dealer");
    });

    // Calculate sum 
    game.dealerSum = sumValues(game.dealerCards);
    game.playerSum = sumValues(game.playerCards);

    // Initial sum in UI 
    playerSumSection.textContent = game.playerSum;
    dealerSumSection.textContent = game.dealerSum - game.dealerCards[0].value;

    // check if there is Blackjack 
    if (game.playerSum == 21) {
        resultMsg = "Wow, you are already blackjack!!"
        endGame();
    } else if (game.dealerSum == 21) {
        resultMsg = "Oops, dealer is blackjack!!" 
        dealerCardsContainer.classList.add("active"); // open first hide dealer card
        dealerSumSection.textContent = game.dealerSum; 
        endGame();
    } else if (game.playerSum == 21 || game.dealerSum == 21) {
        dealerCardsContainer.classList.add("active");
        dealerSumSection.textContent = game.dealerSum;
        resultMsg = "You and dealer are Blackjack"
        endGame();
    }

    // Show hit & stand buttons
    if (game.playerCards.length == 2) {
        showTableBtn(); 
    }

    hitBtn.addEventListener('click', handleHitButton);
    standBtn.addEventListener('click',haddleStandButton);
}

function resetUiState() {
    cardIndex = 0;
    restartSection.style.display = "none";
    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";
    hitBtn.removeEventListener("click", handleHitButton);
    standBtn.removeEventListener("click", haddleStandButton);
    dealerCardsContainer.classList.remove("active"); // D's first card open    
}

function shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function renderCard(card, who) {
    const cardElement = card.createCardElement(); // Create the card element
    if (who === "player") {
        playerCardsContainer.appendChild(cardElement);
    } else if (who === "dealer") {
        dealerCardsContainer.appendChild(cardElement);
    }
}

function getOneCard() {
    card = new Card(
        DEC[cardIndex][0] + convertToType(DEC[cardIndex]), 
        parseInt(convertToValue(DEC[cardIndex])),
        getColor(DEC[cardIndex])
    );
    cardIndex++;
    return card;
}

function sumValues(cards){
    let sum = 0;
    cards.forEach( e => {
        sum += e.value;
    })
    return sum;
}

function convertToType(card) {
    const type = card[1];
    let suit;
    if (type === "c") {
        suit = '♣';
    } else if (type === "s") {
        suit = '♠';
    } else if (type === "d") {
        suit = '♦';
    } else {
        suit = "♥";
    }
    return suit;
}

function convertToValue(card){
    const num = card[0];
    let value;
    if (num === "a") {
        value = 11;
    } else if (num == "j" || num == "q" || num == "k") {
        value = 10; 
    } else { 
        value = num;
    }
    return value;
}

function getColor(card) {
    const type = card[1];
    if (type === "d" || type === "h") {
        return "red";
    } 
    return "black";
}

function showTableBtn() {
    const tableBtn = document.querySelectorAll(".table-btn");
    tableBtn.forEach(element => {
        element.classList.add("activated");      
    }
)}

function handleHitButton() {
        game.playerCards.push(getOneCard());
        renderCard(game.playerCards[game.playerCards.length - 1], "player");
        game.playerSum = sumValues(game.playerCards);
        playerSumSection.textContent = game.playerSum;
        
        //Detect how many ace cards player has 
        const ace = 11;
        const countAce = game.playerCards.filter((card) => card.value === ace).length;

        game.playerSum = convertAceSum(countAce, game.playerSum);
        evaluateSum("You", game.playerSum);

        playerSumSection.textContent = game.playerSum;
}

function haddleStandButton() {
    dealerCardsContainer.classList.add("active"); // D's first card open
    dealerSumSection.textContent = game.dealerSum;

    while (game.dealerSum < 17) {
        game.dealerCards.push(getOneCard());
        renderCard(game.dealerCards[game.dealerCards.length - 1], "dealer");
        game.dealerSum = sumValues(game.dealerCards);
        dealerSumSection.textContent = game.dealerSum;
    }

    evaluateSum("Dealer", game.dealerSum);
    if (resultMsg === CONTINUE) {
        evaluateWinner(game.playerSum, game.dealerSum);
    }
}

function convertAceSum (aceCount, sum) {
    if (sum <= 21 || aceCount == 0){
        return sum; 
    } else if (aceCount != 0) {
        sum = sum - (aceCount + 1) * 10 + 1;
        return sum;
    }
}       

function evaluateSum (who, sum) {
    if (sum == 21) {
        resultMsg = who + " blackjack!";
        endGame();
    } else if (sum < 21) {;
        resultMsg = CONTINUE;
    } else if (sum > 21) {
        resultMsg = who + " bust!";
        endGame();
    }
}

function evaluateWinner (player1, player2) {
    if (player1 > player2) {
        resultMsg = "You win!"
        endGame();
    } else if (player1 < player2 ) {
        resultMsg = "The dealer wins!"
        endGame();

    } else if (player1 == player2 ) {
        resultMsg = "DRAW!!"
        endGame();
    }
}

function endGame () {
    resultline.textContent = resultMsg;
    restartSection.style.display = "block";
    restartBtn.addEventListener('click', gameStart);
}  
