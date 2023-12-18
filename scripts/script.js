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

class CardController {
    constructor() {
        this.dec = ["ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "jc", "qc","kc","as","2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "js", "qs","ks","ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "jd", "qd","kd","ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "jh", "qh","kh"];
        this.cardIndex = 0;
    }

    convertAceSum (aceCount, sum) {
        if (sum <= 21 || aceCount == 0){
            return sum; 
        } else if (aceCount != 0) {
            if (sum <= (aceCount + 1) * 10 + 1) { 
                sum =  sum - (aceCount - 1) * 10;
            } else if (sum > (aceCount + 1) * 10 + 1) {
                sum = sum - aceCount * 10;
            }
            return sum;
        }
    }     
    
    getOneCard() {
        let card = new Card(
            this.dec[this.cardIndex][0] + this.convertToType(this.dec[this.cardIndex]), 
            parseInt(this.convertToValue(this.dec[this.cardIndex])),
            this.getColor(this.dec[this.cardIndex])
        );
        this.cardIndex++;
        return card;
    }
    
    convertToType(card) {
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
    
    convertToValue(card){
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
    
    getColor(card) {
        const type = card[1];
        if (type === "d" || type === "h") {
            return "red";
        } 
        return "black";
    }

    shuffle() {
        for (let i = this.dec.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.dec[i], this.dec[j]] = [this.dec[j], this.dec[i]];
        }
    }
}

const CONTINUE = "continue";

class Game {
    constructor() {
        this.resetStates();

        startBtn.addEventListener('click', this.startGame.bind(this));
        hitBtn.addEventListener('click', this.handleHitButton.bind(this));
        standBtn.addEventListener('click', this.handleStandButton.bind(this));
        restartBtn.addEventListener('click', this.gameStart.bind(this));
    }

    resetStates() {
        this.dealerCards = [];
        this.playerCards = [];
        this.dealerSum = 0;
        this.playerSum = 0;
        this.resultMsg = CONTINUE;
        this.cardController = new CardController();
        
        restartSection.style.display = "none";
        playerCardsContainer.innerHTML = "";
        dealerCardsContainer.innerHTML = "";
        hitBtn.removeEventListener("click", this.handleHitButton);
        standBtn.removeEventListener("click", this.handleStandButton);
        dealerCardsContainer.classList.remove("active"); // D's first card open    
    }

    startGame = () => {
        startSection.style.display = "none";
        gameSection.style.display= "block";
        loadingBox.style.display= "none";
        this.gameStart();
    }
    
    gameStart = () => {
        this.resetStates();

        this.cardController.shuffle();

        // Player gets two cards 
        this.playerCards.push(this.cardController.getOneCard());
        this.playerCards.push(this.cardController.getOneCard());
    
        // Dealer gets two cards 
        this.dealerCards.push(this.cardController.getOneCard());
        this.dealerCards.push(this.cardController.getOneCard());
    
        // Player card UI
        this.playerCards.forEach(element => {
            this.renderCard(element, "player");
        });
    
        // Dealer card UI
        this.dealerCards.forEach(element => {
            this.renderCard(element, "dealer");
        });
    
        // Calculate sum 
        this.dealerSum = this.sumValues(this.dealerCards);
        this.playerSum = this.sumValues(this.playerCards);
    
        // Initial sum in UI 
        playerSumSection.textContent = this.playerSum;
        dealerSumSection.textContent = this.dealerSum - this.dealerCards[0].value;
    
        // check if there is Blackjack 
        if (this.playerSum == 21) {
            this.resultMsg = "Wow, you are already blackjack!!"
            this.endGame();
        } else if (this.dealerSum == 21) {
            this.resultMsg = "Oops, dealer is blackjack!!" 
            dealerCardsContainer.classList.add("active"); // open first hide dealer card
            dealerSumSection.textContent = this.dealerSum; 
            this.endGame();
        } else if (this.playerSum == 21 || this.dealerSum == 21) {
            dealerCardsContainer.classList.add("active");
            dealerSumSection.textContent = this.dealerSum;
            this.resultMsg = "You and dealer are Blackjack"
            this.endGame();
        }

        // Edge case - when initial cards are both As
        if (this.dealerSum == 22) {
            this.evaluateSum("Dealer", this.dealerSum);
            dealerCardsContainer.classList.add("active"); // D's first card open
            dealerSumSection.textContent = this.dealerSum;
        } else if (this.playerSum == 22) {
            this.playerSum = this.cardController.convertAceSum(2, this.playerSum);
            playerSumSection.textContent = this.playerSum;
        }
    
        // Show hit & stand buttons
        if (this.playerCards.length == 2) {
            this.showTableBtn(); 
        }
    }

    handleHitButton() {
            this.playerCards.push(this.cardController.getOneCard());
            this.renderCard(this.playerCards[this.playerCards.length - 1], "player");
            this.playerSum = this.sumValues(this.playerCards);
            playerSumSection.textContent = this.playerSum;
            
            //Detect how many ace cards player has 
            const ace = 11;
            const countAce = this.playerCards.filter((card) => card.value === ace).length;

            this.playerSum = this.cardController.convertAceSum(countAce, this.playerSum);
            this.evaluateSum("You", this.playerSum);

            playerSumSection.textContent = this.playerSum;
    }

    handleStandButton() {
        dealerCardsContainer.classList.add("active"); // D's first card open
        dealerSumSection.textContent = this.dealerSum;

        while (this.dealerSum < 17) {
            this.dealerCards.push(this.cardController.getOneCard());
            this.renderCard(this.dealerCards[this.dealerCards.length - 1], "dealer");
            this.dealerSum = this.sumValues(this.dealerCards);
            dealerSumSection.textContent = this.dealerSum;
        }

        this.evaluateSum("Dealer", this.dealerSum);
        if (this.resultMsg === CONTINUE) {
            this.evaluateWinner(this.playerSum, this.dealerSum);
        }
    }

    renderCard(card, who) {
        const cardElement = card.createCardElement(); // Create the card element
        if (who === "player") {
            playerCardsContainer.appendChild(cardElement);
        } else if (who === "dealer") {
            dealerCardsContainer.appendChild(cardElement);
        }
    }

    showTableBtn() {
        const tableBtn = document.querySelectorAll(".table-btn");
        tableBtn.forEach(element => {
            element.classList.add("activated");      
        })
    }

    sumValues(cards){
        let sum = 0;
        cards.forEach( e => {
            sum += e.value;
        })
        return sum;
    }

    evaluateSum(who, sum) {
        if (sum == 21) {
            this.resultMsg = who + " blackjack!";
            this.endGame();
        } else if (sum < 21) {;
            this.resultMsg = CONTINUE;
        } else if (sum > 21) {
            this.resultMsg = who + " bust!";
            this.endGame();
        }
    }

    evaluateWinner(player1, player2) {
        if (player1 > player2) {
            this.resultMsg = "You win!"
            this.endGame();
        } else if (player1 < player2 ) {
            this.resultMsg = "The dealer wins!"
            this.endGame();

        } else if (player1 == player2 ) {
            this.resultMsg = "DRAW!!"
            this.endGame();
        }
    }

    endGame() {
        resultline.textContent = this.resultMsg;
        restartSection.style.display = "block";
    }
}

const game = new Game();
