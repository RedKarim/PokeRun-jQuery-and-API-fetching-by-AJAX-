const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");
const level = document.querySelector(".level");

let gameStart = new Audio();
gameStart.src = "assets/audio/game_theme.mp3";

const levelSpeed = { easy: 7, moderate: 10, difficult: 14 };

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let player = { speed: 7, score: 0 };

level.addEventListener("click", (e) => {
  player.speed = levelSpeed[e.target.id];
});

startScreen.addEventListener("click", () => {
  startScreen.classList.add("hide");
  gameArea.innerHTML = "";

  player.start = true;
  gameStart.play();
  gameStart.loop = true;
  player.score = 0;
  window.requestAnimationFrame(gamePlay);

  for (let i = 0; i < 5; i++) {
    let roadLineElement = document.createElement("div");
    roadLineElement.setAttribute("class", "roadLines");
    roadLineElement.y = i * 2000;
    roadLineElement.style.top = roadLineElement.y + "px";
    gameArea.appendChild(roadLineElement);
  }

  let pokeElement = document.createElement("div");
  pokeElement.setAttribute("class", "poke");
  gameArea.appendChild(pokeElement);

  // Set the player's Pokémon (Pikachu)
  setPokemonImage(pokeElement, 25, "back_default");

  player.x = pokeElement.offsetLeft;
  player.y = pokeElement.offsetTop;

  for (let i = 0; i < 3; i++) {
    let enemypoke = document.createElement("div");
    enemypoke.setAttribute("class", "enemypoke");
    enemypoke.y = (i + 1) * 1000 * -1;
    enemypoke.style.top = enemypoke.y + "px";
    enemypoke.style.left = Math.floor(Math.random() * 1000) + "px";
    gameArea.appendChild(enemypoke);

    // Set random Pokémon for enemies
    let randomNo = Math.floor(Math.random() * 1017) + 1;
    setPokemonImage(enemypoke, randomNo, "front_default");
  }
});

function setPokemonImage(element, no, imageType) {
  let url = "https://pokeapi.co/api/v2/pokemon/" + no;
  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
  }).done(function (data) {
    element.style.backgroundImage = `url(${data.sprites[imageType]})`;
  });
}

function onCollision(poke, enemypoke) {
  let pokeRect = poke.getBoundingClientRect();
  let enemyRect = enemypoke.getBoundingClientRect();

  // Calculate the centers of both elements
  let pokeCenterX = pokeRect.left + pokeRect.width / 2;
  let pokeCenterY = pokeRect.top + pokeRect.height / 2;
  let enemyCenterX = enemyRect.left + enemyRect.width / 2;
  let enemyCenterY = enemyRect.top + enemyRect.height / 2;

  // Calculate the distance between the centers
  let distance = Math.sqrt(
    Math.pow(pokeCenterX - enemyCenterX, 2) +
      Math.pow(pokeCenterY - enemyCenterY, 2)
  );

  // Determine the collision threshold (half the width of poke, assuming both elements are of similar size)
  let collisionThreshold = pokeRect.width / 2;

  // Return true if the distance is less than the collision threshold
  return distance < collisionThreshold;
}
function onGameOver() {
  player.start = false;
  gameStart.pause();
  startScreen.classList.remove("hide");
  startScreen.innerHTML =
    "ゲームオーバー<br> 最終スコアは次のとおりです<br>" +
    player.score +
    "<br> ここを押すとゲームが再開されます。";
}

function moveRoadLines() {
  let roadLines = document.querySelectorAll(".roadLines");
  roadLines.forEach((item) => {
    if (item.y >= 700) {
      item.y -= 750;
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function moveEnemypokes(pokeElement) {
  let enemypokes = document.querySelectorAll(".enemypoke");
  enemypokes.forEach((item) => {
    if (onCollision(pokeElement, item)) {
      onGameOver();
    }
    if (item.y >= 1200) {
      item.y = -300;
      item.style.left = Math.floor(Math.random() * 350) + "px";
      let randomNo = Math.floor(Math.random() * 100) + 1;
      setPokemonImage(item, randomNo, "front_default");
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function gamePlay() {
  let pokeElement = document.querySelector(".poke");
  let road = gameArea.getBoundingClientRect();

  if (player.start) {
    moveRoadLines();
    moveEnemypokes(pokeElement);

    if (keys.ArrowUp && player.y > road.top + 70) player.y -= player.speed;
    if (keys.ArrowDown && player.y < road.bottom - 85) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < road.width - 70) player.x += player.speed;

    pokeElement.style.top = player.y + "px";
    pokeElement.style.left = player.x + "px";

    window.requestAnimationFrame(gamePlay);

    player.score++;
    const ps = player.score - 1;
    score.innerHTML = "Score: " + ps;
  }
}

document.addEventListener("keydown", (e) => {
  e.preventDefault();
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  keys[e.key] = false;
});
