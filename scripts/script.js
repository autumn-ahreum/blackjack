"use strict";

// Get html elements
const startSection = document.querySelector(".start-section");
const startBtn = document.getElementById("start-button");
const loadingBox = document.querySelector(".loading-box");
const gameSection = document.querySelector(".game");
const dealerCardsContainer = document.getElementById("dealer-cards-container");
const dealerSumSection = document.querySelector(".dealer-sum")
const hitBtn = document.querySelector(".hit");
const standBtn = document.querySelector(".stand");
const playerCardsContainer = document .getElementById("player-cards-container");
const playerSumSection = document.querySelector(".palyer-sum");
const restartSection = document.querySelector(".restart-section")
const resultline = document.querySelector(".result-line p");
const restartBtn = document.querySelector(".restart");


// Start Game
startBtn.addEventListener('click', startGame);

let newGame;
let resultMsg = "continue";

function startGame() {
    startSection.style.display = "none";
    gameSection.style.display= "block";
    loadingBox.style.display= "none";
    gameStart();
}

// 1. Create Cards by using array
//  1-1. 1 Dec Array 
const dec = ["ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "jc", "qc","kc","as","2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "js", "qs","ks","ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "jd", "qd","kd","ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "jh", "qh","kh"]

// Card Class
class Card {
    constructor(name, value, color){
        this.name = name; // A♤ what is shown in UI
        this.value = value; // 1 - 11 used in sum
        this.color = color;
        this.element = this.createCardElement();
    }

    createCardElement() {
        const card = document.createElement("div");
        card.classList.add("card");
        card.classList.add(this.color)
        card.innerHTML = 
            `<div id="${this.name}">
                <span class="card-name">${this.name}</span>
            </div>
            `;
            return card;
    }
}

function renderCard(card, who) {
    const cardElement = card.createCardElement(); // Create the card element
    let sum = 0;
    if (who === "player") {
        playerCardsContainer.appendChild(cardElement);
    } else if (who === "dealer") {
        dealerCardsContainer.appendChild(cardElement);
    }

}

function sumValues(cards){
    let sum = 0;
    cards.forEach( e => {
        sum += e.value;
    })
    return sum;
}



class Game {
    constructor() {
        this.dealerCards = [];
        this.playerCards = [];
        this.dealerSum = 0;
        this.playerSum = 0;
    }
}

let cardIndex = 0;
let card; 

function getOneCard() {

    card = new Card(
        dec[cardIndex][0] + convertToType(dec[cardIndex]), 
        parseInt(convertToValue(dec[cardIndex])),
        getColor(dec[cardIndex])
    );
    console.log(card.color);

    cardIndex++;
    return card;
}

function shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
}
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
        // card.style.color = "red";

    }
    return suit;
}

function getColor(card) {
    const type = card[1];
    if (type === "d" || type === "h") {
        return "red";
    } 
    return "black";
}


function introMassege() {


    setTimeout (function () {
         alert('My alert massege')
    }, 1000)
};



function resetUiState() {
    restartSection.style.display = "none";
    playerCardsContainer.innerHTML = ""
    dealerCardsContainer.innerHTML = ""
    hitBtn.removeEventListener("click", handleHitButton);
    // standBtn.removeEventListener();
    
}
// 2. Game Start
//  2-1. shuffle 1 dec 
//  2-2. player gets two cards first 
//  2-3. dealer gets two cards, one is hide. 
//  2-4. calculate sum for dealer and player :
// game start : player and dealer get two cards 
function gameStart(){

    resetUiState();

    shuffle(dec);
    newGame = new Game();

    // player gets one card and one card 
    newGame.playerCards.push(getOneCard());
    newGame.playerCards.push(getOneCard());

    // dealer gets one card and one card 
    newGame.dealerCards.push(getOneCard());
    newGame.dealerCards.push(getOneCard());

    //show each array card in UI as an element
    newGame.playerCards.forEach(element => {
        renderCard(element, "player");
    })

    newGame.dealerCards.forEach(element => {
        renderCard(element, "dealer");
    })

    // Calculate sum 
    newGame.dealerSum = sumValues(newGame.dealerCards);
    newGame.playerSum = sumValues(newGame.playerCards);

    // sum in UI 
    playerSumSection.textContent = newGame.playerSum;
    dealerSumSection.textContent = newGame.dealerSum;

    // check it there is Blackjack
    if (newGame.playerSum == 21) {
        resultMsg = "Wow, you are blackjack!!"
        endGame();
    } else if (newGame.dealerSum == 21) {
        resultMsg = "oops, dealer is blackjack!!"
        endGame();
    } else if (newGame.playerSum == 21 || newGame.dealerSum == 21) {
        resultMsg = "Player and dealer are Blackjack"
        endGame();
    }

    //show 'hit' 'stand' buttons
    if (newGame.playerCards.length == 2) {
        showTableBtn(); 
    }

//       2-4-2. if player hits 
//                 2-4-2-1. player gets one card (card[4])
    hitBtn.addEventListener('click', () => { handleHitButton(newGame) }, false);

    standBtn.addEventListener('click', function(){
        
        // later ) flip over dealer's hidden card 
        // later ) show the dealer sum 

//                 2-4-1-1. while dealer sum less then 17, add 1 card(ex. card[4],card[5], card[6]]
//                 2-4-1-2. if dealer sum is more than 21, dealer burst -> "player wins"
//                 2-4-1-2. else, compare with player sum and evaluate who wins -> go to 2-6

        while (newGame.dealerSum < 17) {
            newGame.dealerCards.push(getOneCard());
            renderCard(newGame.dealerCards[newGame.dealerCards.length - 1], "dealer");
            newGame.dealerSum = sumValues(newGame.dealerCards);
            dealerSumSection.textContent = newGame.dealerSum;
        }

        if (newGame.dealerSum > 21) {
            console.log("dealer is Burst!!")
        } else {
            return newGame.dealerSum;
        }

        evaluateWinner(newGame.playerSum, newGame.dealerSum);

    });
}

function handleHitButton(obj) {
        obj.playerCards.push(getOneCard());
        renderCard(obj.playerCards[obj.playerCards.length - 1], "player");
        obj.playerSum = sumValues(obj.playerCards);
        playerSumSection.textContent = obj.playerSum;


        //Function  : player has ace 
        const playerHasAce = obj.playerCards.find((card) =>  card.value == "11")

        
        if(playerHasAce){
            console.log("player has an ace!")
        } else {
            console.log("player doesn't have an ace!")
        }

        //Function : detect how many ace cards player has 
        const ace = 11;
        const countAce = obj.playerCards.filter((card) => card.value === ace).length;

        console.log("You have", countAce, "ace!!")

        obj.playerSum = convertAceSum(countAce, obj.playerSum);
        evaluateSum("player", obj.playerSum);

        playerSumSection.textContent = obj.playerSum;
}

function showTableBtn() {
    const tableBtn = document.querySelectorAll(".table-btn");
    tableBtn.forEach(element => {
        element.classList.add("activated");      
    }
)}


function convertAceSum (aceCount, sum) {
    if(sum <= 21 || aceCount == 0){
        return sum; 
    } else if (aceCount != 0) {
        sum = sum - (aceCount+1)*10 +1 
        return sum;
    }
}       


function evaluateSum (who, sum) {
    if (sum == 21) {
        resultMsg = who + " is Blackjack!"
        endGame();
    } else if (sum < 21) {;
        resultMsg = "continue"
    } else if (sum > 21) {
        resultMsg = who + " is Burst!"
        endGame();
    }
}

function evaluateWinner (player1, player2) {
    if (player1 > player2) {
        resultMsg = "dealer wins!"
        endGame();
    } else if (player1 < player2 ) {
        resultMsg = "player wins!"
        endGame();

    } else if (player1 == player2 ) {
        resultMsg = "draw!!"
        endGame();
    }
}

function endGame () {
    resultline.textContent = resultMsg;
    restartSection.style.display = "block"
    restartBtn.addEventListener('click', gameStart);
}  
//detect cards array has a ace 

//      2-4-1. if dealer or player sum is 21 (blackjack) go to 2-6 
//  2-5. show stand or hit btn :
//      2-4-1. if player stands
//                 2-4-1-1. while dealer sum less then 17, add 1 card(ex. card[4],card[5], card[6]]
//                 2-4-1-2. if dealer sum is more than 21, dealer burst -> "player wins"
//                 2-4-1-2. else, compare with player sum and evaluate who wins -> go to 2-6
//       2-4-2. if player hits 
//                 2-4-2-1. player gets one card (card[4])
//                      2-4-2-1-1. if player sum is 21 -> player "blackjack" 
//                      2-4-2-1-2. if player sum more than 21 and doen't have no ace, burst -> "Dealer wins"
//                      2-4-2-1-3. if player sum more than 21 and had a ace, count ace as 1, ->  go back to 2.5 
//                      2-4-2-1-4. if player sum less than 21 ->  go back to 2.5 
//  2-6. evaluate who wins 
//      2-6-1. if dealer sum is more than player sum -> "dealer wins"
//      2-6-2. if player sume is more than dealer sum -> "player wins"
//      2-6-3. if player sume is equal than dealer sum -> "draw"
    