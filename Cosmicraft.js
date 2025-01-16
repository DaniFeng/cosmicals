var FGColor = "#2E3752";
var BGColor = "#d5e8e8";

const UI_WIDTH = 820;
const UI_HEIGHT = 625;
const CANVAS_OFFSET_X = 120
const CANVAS_OFFSET_Y = 75

//1 is draw, 2 is erase, 3 is stamp, 4 is kill, 5 is colorpick
var currentTool = 1;

var brushSize = 5;
var currentBrushShapeIndex = 1; //future
var eraserSize = 40;
var currentEraserShapeIndex = 0;
var brushToolbar;

const STAMP_SIZE = 75;
var currentStampIndex = 2;
var stampToolbar;

//main UI display icons
let saveButtonImg;
let undoButtonImg;
let redoButtonImg;
let drawButtonImg;
let eraseButtonImg;
let stampButtonImg;
let killButtonImg;
let colorPickerButtonImg;

let colorPickerImgBg; //backdrops for UI parts
let currentColorImgBg;
let headerImg;
let footerImg;

//var drawSlider; //default GUI stuff 
//var eraseSlider;

var cosmiCanvas; //P5.graphic that will be the drawing canvas
var cosmiBackground; //P5.graphic that will just be solid background that ppl can change

var previousMouseX = 0;
var previousMouseY = 0;

var undos = []
var redos = []
const MAX_UNDOS = 25 //maximum amount of undos to keep browser from being laggy

var colorPickOnBG = false; //if we are changing the FG color or BG color
var defaultPicker;
var defaultPickCol = FGColor;

var lerpHue;
var theLerps;
const BLOCK_X = 10 //position of the color block
const BLOCK_Y = 390
const BLOCK_SIZE = 100  //size of color block

const SLIDER_HEIGHT = 10 //have at 10
const SLIDER_LENGTH = 100 //have at 100
const SLIDER_X = 10
const SLIDER_Y = 370

var theStamps = []; //try to delete later

// Load the image.
function preload() {
  theStamps[0] = loadImage("https://i.imgur.com/1pLCYdn.png"); //loads stamps
  theStamps[1] = loadImage("https://i.imgur.com/aPilMVR.png");
  theStamps[2] = loadImage("https://i.imgur.com/Y7rAqNa.png");

  stampToolbar = new ToolBar(120, 0, STAMP_SIZE,'https://file.garden/Z3w2DgI9XxDVyEMC/stampsList.txt'); //stamps list
  brushToolbar = new ToolBar(120, 40, 35,'https://file.garden/Z3w2DgI9XxDVyEMC/brushEraserSizeList.txt'); //brush size list

  saveButtonImg = createImg("https://i.imgur.com/oTbfRg3.png"); //loads tool icons
  saveButtonImg.position(0, 0);
  saveButtonImg.mouseClicked(() => saveDrawing());
  
  undoButtonImg = createImg("https://i.imgur.com/JrzeURj.png");
  undoButtonImg.position(60, 37);
  undoButtonImg.mouseClicked(() => undoThat());

  redoButtonImg = createImg("https://i.imgur.com/maoIW36.png");
  redoButtonImg.position(60, 0);
  redoButtonImg.mouseClicked(() => redoThat());  

  drawButtonImg = createImg('https://i.imgur.com/zptxfnY.png');
  drawButtonImg.position(0, 75);
  drawButtonImg.mouseClicked(() => currentTool = 1); 
  
  eraseButtonImg = createImg("https://i.imgur.com/HvgWF4j.png");
  eraseButtonImg.position(0, 75 + 56);
  eraseButtonImg.mouseClicked(() => currentTool = 2);
 
  stampButtonImg = createImg("https://i.imgur.com/31rZfz0.png");
  stampButtonImg.position(0, 75 + 2 * 56);
  stampButtonImg.mouseClicked(() => currentTool = 3);

  killButtonImg = createImg("https://i.imgur.com/CCmj8oj.png");
  killButtonImg.position(0, 75 + 3 * 56);
  killButtonImg.mouseClicked(() => killTool());
  
  colorPickerButtonImg = createImg("https://i.imgur.com/fYEppLc.png");
  colorPickerButtonImg.position(0, 75 + 4 * 56);
  colorPickerButtonImg.mouseClicked(() => currentTool = 5);

  colorPickerImgBg = loadImage("https://i.imgur.com/CUEvZX4.png");  //pics here and below are static BG images 
  currentColorImgBg = loadImage("https://i.imgur.com/bTe3VLt.png");
  headerImg = loadImage("https://i.imgur.com/l4rH24B.png");
  footerImg = loadImage("https://i.imgur.com/52X7Pw3.png");
}

function setup() {
  brushToolbar.loadIcons(); 
  stampToolbar.loadIcons();

  createCanvas(UI_WIDTH, UI_HEIGHT); // whole program 820 x 625 for now 

  image(colorPickerImgBg, 0, 75 + 5 * 56); //color picker BG
  image(currentColorImgBg, 0, 75 + 5 * 56 + 150); //current color swatch bg
  image(headerImg, CANVAS_OFFSET_X, 0); //header bg
  image(footerImg, 120, 575); //footer bg            

  cosmiBackground = createGraphics(700, 500); //solid background
  cosmiBackground.background(BGColor); 

  cosmiCanvas = createGraphics(700, 500);  //invisible drawing canvas

  drawBGColorSwatch();
  drawFGColorSwatch();

  defaultPicker = createColorPicker(defaultPickCol); //default color picker stuff
  defaultPicker.position(150, 585);
  
  noStroke();

  lerpHue = color(255,0,0);
  theLerps = [
    [color(255,0,0), 0],
    [color(255,255,0), (1/6)],
    [color(0,255,0), (1/3)],
    [color(0,255,255), (1/2)],
    [color(0,0,255), (2/3)],
    [color(255,0,255), (5/6)],
    [color(255,0,0), 1]
  ] 
  updateColorBlock();
  colorSlider();
}


function draw() {  //makes the actual drawing canvas
  noSmooth(); //does this even do anything lmao

  image(cosmiBackground, CANVAS_OFFSET_X, CANVAS_OFFSET_Y); //constantly displays both canvases
  image(cosmiCanvas, CANVAS_OFFSET_X, CANVAS_OFFSET_Y);

  //when mouse pressed
  let x = mouseX-CANVAS_OFFSET_X; 
  let y = mouseY-CANVAS_OFFSET_Y; 
 
  if(mouseIsPressed){
    if(inBounds(x,y))
      cosmiCanvas.mousePressed(toolUse(x,y)); // in canvas
    else if //color block
    (mouseX > BLOCK_X && mouseX < BLOCK_X+BLOCK_SIZE && mouseY > BLOCK_Y && mouseY < BLOCK_Y+BLOCK_SIZE)
      colorPickerTool(mouseX, mouseY, true);  
    else if //color slider
    (mouseX > SLIDER_X && mouseX < SLIDER_X+SLIDER_LENGTH && mouseY > SLIDER_Y && mouseY < SLIDER_Y+SLIDER_HEIGHT){
      let newHue = get(mouseX, mouseY); 
      lerpHue = color(newHue[0], newHue[1], newHue[2])
      updateColorBlock();
    }
  }

  previousMouseX = x;
  previousMouseY = y;
  
  defaultColorPicker();

  if(colorPickOnBG){
    drawBGColorSwatch();
  } else{      
    drawFGColorSwatch();
  }  
}

function updateColorBlock(){  
  for (i = 0; i < BLOCK_SIZE; i++){
    valueLerp = lerpColor(color(0), color(255), (i/BLOCK_SIZE));
    
    for (j = 0; j < BLOCK_SIZE; j++){
      let pixelColor = lerpColor(valueLerp, lerpHue, (j/BLOCK_SIZE))
      fill(pixelColor);
      rect(i+BLOCK_X, j+BLOCK_Y, 1, 1)
    }
  }
}

function colorSlider(){ //have it so that when slider is clicked, it changes colorBlock
  for (k = 0; k < SLIDER_LENGTH; k++){
    fill(paletteLerp(theLerps, (k/SLIDER_LENGTH)))
    rect(k+SLIDER_X, SLIDER_Y, 1, SLIDER_HEIGHT)
  }  
}

function keyPressed() { //for testing
  if (key === "1") {
    currentTool = 1;
  } else if (key === "2") {
    brushToolbar.show();
    currentTool = 2;
  } else if (key === "3") {
    stampToolbar.show();
    currentTool = 3;
  } else if(key === "4"){
    killTool();
  } else if(key === "5"){
    currentTool = 5;
  } else if(key === "6"){
    currentBrushShapeIndex = !currentBrushShapeIndex;
  } else if(key === "7"){
    currentEraserShapeIndex = !currentEraserShapeIndex;
  } else if (key === 's') {
    saveDrawing();     
  } else if (key === 'z') {
    undoThat();
  }  else if (key === 'y') {
    redoThat();
  }
}

