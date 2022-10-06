const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 1000;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

window.userInputs = getUserInputs();
setUserInputs(userInputs);

let bestCar = cars[0];

function run() {
  animate();
  window.userInputs = getUserInputs();
  setUserInputs();
}

function setUserInputs() {
  window.traffic = createTraffic(userInputs.get("traffic"));
  window.cars = generateCars(userInputs.get("genSize"));

  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
      if (i != 0) {
        NeuralNetwork.mutate(cars[i].brain, userInputs.get("mutationValue"));
      }
    }
  }
}

function getUserInputs() {
  let userInputs = new Map();
  userInputs.set(
    "turnSensitivity",
    document.getElementById("turnSensitivity").value
  );
  userInputs.set("maxSpeed", document.getElementById("maxSpeed").value);
  userInputs.set("numRays", document.getElementById("numRays").value);
  userInputs.set("rayLength", document.getElementById("rayLength").value);
  userInputs.set("traffic", document.getElementById("traffic").value);
  userInputs.set("genSize", document.getElementById("genSize").value);
  userInputs.set(
    "mutationValue",
    document.getElementById("mutationValue").value
  );

  return userInputs;
}

function saveBrain() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discardBrain() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(
      new Car(
        road.getLaneCenter(1),
        100,
        30,
        50,
        "AI",
        userInputs.get("maxSpeed"),
        userInputs.get("turnSensitivity"),
        userInputs.get("rayLength"),
        userInputs.get("numRays"),
        "chartreuse"
      )
    );
  }
  return cars;
}

function createTraffic(amountCars) {
  const traffic = [];
  for (let i = 1; i < amountCars; i++) {
    traffic.push(
      new Car(
        road.getLaneCenter(Math.floor(Math.random() * 4)),
        -i * 120, //* Math.floor(Math.random() * (180 - 90) + 90),
        30,
        50,
        "BOT",
        2,
        0,
        0,
        0,
        getRandomColor()
      )
    );
  }
  return traffic;
}

// mess with this to fix run button multiple clicks
function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.8);

  road.draw(carCtx);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx);
  }

  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx);
  }

  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time * 0.05;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
