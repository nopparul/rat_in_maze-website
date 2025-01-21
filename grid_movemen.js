function mapMazeToFile(maze) {
    switch (maze.toLowerCase()) {
        case "maze1":
        return "maize_1.txt";
        case "maze2":
        return "maize_2.txt";
        case "maze3":
        return "maize_3.txt";
        case "maze4":
        return "maize_4.txt";
        default:
        return null;
    }
}
function back() {
  window.location.href = 'maze.html';
}
function home() {
    window.location.href = 'index.html';
}
document.addEventListener("DOMContentLoaded", function () {

    const urlParams = new URLSearchParams(window.location.search);
    let maze = urlParams.get('maze');

    const fileName = mapMazeToFile(maze);

    if (!fileName) {
        document.getElementById("charArray").innerText = "Error: Invalid maze parameter!";
        return;
    }

    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not fetch file: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const lines = data.split('\n');
            let charArray2D = [];

            lines.forEach(line => {
                const parts = line.trim().split(' ');
                const lineChars = parts.join('').replace(/,/g, '').split('');
                charArray2D.push(lineChars);
            });
            console.log(charArray2D);
            initializeGrid(charArray2D);
        })
        .catch(error => {
            document.getElementById("charArray").innerText = "Error: " + error.message;
            console.error("Error reading the file:", error);
        });
});

let listfood = null;
let foodcount = 0;
let grid = [];
let ratPosition = { row: 0, col: 0 };
let data = null;



function initializeGrid(gridData) {
    grid = gridData;
    
    const foodcount = grid.flat().filter(value => value === 'F').length;
    listfood = new Array(foodcount);
    let for_addfood = 0;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "R") {
                ratPosition = { row: i, col: j };
            }
            if (grid[i][j] === "F") {
                listfood[for_addfood] = new Food(i, j);
                for_addfood++;
            }
        }
    }
    data = new Arraytmatrix(grid,listfood ,ratPosition)

    console.log(listfood);
    
    console.log("Hello world!");
    console.log("before render");
    data.renderGrid();
    console.log("after render");
}


function moveRatHandler(dir) {
    const result = data.moveRat(dir);
}

function findFoodhandler(){
    const result = data.autoSolve();
}


class Arraytmatrix {
    
    constructor(grid, listfood, ratPosition) {
        const { row, col } = ratPosition;
        this.ratPosition = ratPosition;

        this.myarray = grid;
        this.myfood = listfood;

        this.move = false;

        this.eatenfood = 0;


        this.rows = this.myarray.length;
        this.cols = this.myarray[0].length;

        this.foodCount = listfood.length;

        this.directions = [
            [1, 0], // Down
            [0, 1], // Right
            [-1, 0],  // Up
            [0, -1]   // Left
        ];
    }

    autoSolve() {
        this.findFood();
    }

    isValid(x, y, visited) {
        return (
            x >= 0 && x < this.rows &&
            y >= 0 && y < this.cols &&
            (this.myarray[x][y] === '1' || this.myarray[x][y] === 'F') &&
            !visited.has(`${x},${y}`)
        );
    }

    async findFood() {
        const { row, col } = this.ratPosition;
        let start = [row, col];
        
        let stack = [start];
        let visited = new Set();
        visited.add(`${start[0]},${start[1]}`);
        let foodCollected = 0;

        while (stack.length > 0) {
            let [x, y] = stack.pop();
            if (this.myarray[x][y] === 'F') {
                foodCollected++;
                this.myarray[x][y] = '1';
                this.foodCount--;
                if (this.foodCount === 0) {
                    this.renderGrid();
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                    alert("All food eaten");
                    return;
                }
                
            }
            
            this.myarray[start[0]][start[1]] = '1';
            this.myarray[x][y] = 'R';
            start = [x, y];

            this.renderGrid();
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            for (let [dx, dy] of this.directions) {
                let newX = x + dx;
                let newY = y + dy;
                if (this.isValid(newX, newY, visited)) {
                    visited.add(`${newX},${newY}`);
                    stack.push([newX, newY]);
                }
            }
        }
        
        if (this.foodCount > 0) {
            alert(`Remaining food: ${this.foodCount}`);
        } else {
            alert("Can't find food");
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById("grid");
        gridContainer.innerHTML = "";
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = `repeat(${this.myarray[0].length}, 60px)`;
        gridContainer.style.gridTemplateRows = `repeat(${this.myarray.length}, 60px)`;
    
        for (let i = 0; i < this.myarray.length; i++) {
            for (let j = 0; j < this.myarray[i].length; j++) {
                const img = document.createElement("img");
                img.style.width = "60px";
                img.style.height = "60px";
                
                if (this.myarray[i][j] === "0") {
                    img.src = "brick.png";
                } else if (this.myarray[i][j] === "1") {
                    img.src = "green.jpg";
                } else if (this.myarray[i][j] === "R") {
                    img.src = "rat.png";
                } else if (this.myarray[i][j] === "F") {
                    img.src = "cheese.png";
                }
    
                gridContainer.appendChild(img);
            }
        }
    }

    moveRat(dir) {
        const { row, col } = this.ratPosition;
        let newRow = row, newCol = col;
        
    
        if (dir === "up" && row > 0) newRow--;
        else if (dir === "down" && row < this.myarray.length - 1) newRow++;
        else if (dir === "left" && col > 0) newCol--;
        else if (dir === "right" && col < this.myarray[0].length - 1) newCol++;
        
        else return;
    
        if (this.myarray[newRow][newCol] !== "0") {
            this.move = true;
            if(this.myarray[newRow][newCol] === "F"){
                this.eatenfood++;
                this.foodCount--;
                console.log(`=====================Finding Food ${this.eatenfood}=====================`);
            }

            this.myarray[row][col] = "1";
            this.myarray[newRow][newCol] = "R";
            this.ratPosition = { row: newRow, col: newCol };

            this.renderGrid();
            
            if(this.eatenfood === this.myfood.length){
                alert("All food eaten");
            }
        }
        else {
            this.move = false;
        }
    }
    
}


class Food {
    constructor(r, c) {
        this.row = r;
        this.col = c;
    }
}


document.body.innerHTML = `
    <div class="container" id="controls">
        <div class="upper">
            <button onclick="home()">HOME</button>
        </div>
        <div class="middle">
            <div class="left">
                <div class="left_top">
                    <button onclick="moveRatHandler('up')">Up</button>
                </div>
                <div class="left_mid">
                    <button onclick="moveRatHandler('left')">Left</button>
                    <button onclick="findFoodhandler()">Auto</button>
                    <button onclick="moveRatHandler('right')">Right</button>
                </div>
                <div class="left_low">
                    <button onclick="moveRatHandler('down')">Down</button>
                </div>
            </div>
            <div class="right">
                <div id="grid">
                    <div class="grid-cell"></div>
                    <div class="grid-cell"></div>
                    <div class="grid-cell"></div>
                    <div class="grid-cell"></div>
                    <div class="grid-cell"></div>
                    <div class="grid-cell"></div>
                    <div class="grid-cell"></div>
                </div>
            </div>
        </div>
        <div class="lowwer">
            <button onclick="back()">BACK</button>
        </div>
    </div>
`;
