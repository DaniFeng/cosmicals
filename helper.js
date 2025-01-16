function defaultColorPicker() { //if default color picker used, swatches update accordingly
  var c = defaultPicker.color().toString('#rrggbb'); 

  if((defaultPickCol.toString('#rrggbb')).toLowerCase() != c){ 
    if(colorPickOnBG)
      BGColor = c;
    else
      FGColor = c;
  }

  defaultPickCol = c;
}

function inBounds(x,y){ //if clicks are within the CosmiCanvas
  let xValid = x > 0 && x < cosmiCanvas.width;
  let yValid = y > 0 && y < cosmiCanvas.height;
  return xValid && yValid;
}

function toolUse(x,y){ //function that goes to da tools
  if (currentTool == 1){ //draw        
      drawOrErase(x,y, false, currentBrushShapeIndex);
  } else if (currentTool == 2){ //erase
      drawOrErase(x,y, true, currentEraserShapeIndex);
  } else if (currentTool == 3){ //stamp   
      stampTool(x,y);
  } else if (currentTool == 4){ //kill will have more options later
     killTool();
  } else if (currentTool == 5){ //color picker
      colorPickerTool(x,y, false);
  } 
}

function mousePressed() { //coding undo stuff
  if(inBounds(mouseX-CANVAS_OFFSET_X, mouseY-CANVAS_OFFSET_Y) && currentTool < 5){
    undoStorage(); 
  } else if (mouseX > 32.5 && mouseX < 87.5 && mouseY > 537.5 && mouseY < 592.5) { //FG color change
    print("hit FG")
    colorPickOnBG = false;
  } else if(mouseX > 73 && mouseX < 103 && mouseY > 520 && mouseY < 550) { //BG color change
    print("hit BG")
    colorPickOnBG = true;
  }
    
}

function undoStorage() { //saves current image in undo stack
  print("undo storage called")
  let tempGraphic = createImage(cosmiCanvas.width, cosmiCanvas.height);
  
  tempGraphic.copy(cosmiCanvas,
    0, 0, cosmiCanvas.width, cosmiCanvas.height,
    0, 0, cosmiCanvas.width, cosmiCanvas.height);

  if(undos.push(tempGraphic) > MAX_UNDOS) //saves undo inside, enforces max undo amount
    undos.shift();
  
}

function undoThat() {
  if(undos.length == 0){
    alert("no more undos for you. lmaoooooooo [current max is " + maxUndoAmount + " undos]")

  } else {
    let pastImage = undos.pop();
    redos.push(pastImage);
    cosmiCanvas.clear();

    cosmiCanvas.copy(pastImage,
    0, 0, cosmiCanvas.width, cosmiCanvas.height,
    0, 0, cosmiCanvas.width, cosmiCanvas.height);

    print("undoThat is done")
  }  
}

function redoThat() { //putting this here for now. Insert later
  if(redos.length == 0){
    print("no more redos for you bruh ! ! ! ")
  } else{  
    let redoImage = redos.pop();
    //undos.push(redoImage);
    cosmiCanvas.clear();

    cosmiCanvas.copy(redoImage,
      0, 0, cosmiCanvas.width, cosmiCanvas.height,
      0, 0, cosmiCanvas.width, cosmiCanvas.height);

    print("redo is done")
    }
} 

function drawOrErase(x,y, onErase, onCircle){
  push();
  let size = brushSize;
  
  if(onErase){
    cosmiCanvas.erase();
    size = eraserSize;
  }

  cosmiCanvas.noStroke();
  cosmiCanvas.noSmooth(); 
  cosmiCanvas.strokeWeight(size);
  
  if(onCircle){
    cosmiCanvas.ellipse( x, y, size);        
  } else{ //on square
    cosmiCanvas.rectMode(CENTER);
    cosmiCanvas.fill(FGColor);
    cosmiCanvas.square( x, y, size);    
  }
  cosmiCanvas.stroke(FGColor);
  cosmiCanvas.line(previousMouseX,previousMouseY, x, y);
  cosmiCanvas.noErase(); 

  pop();  
}

function stampTool(x,y){ //using the stamp tool
  cosmiCanvas.image(
    theStamps[currentStampIndex],
    x - STAMP_SIZE / 2,
    y - STAMP_SIZE / 2
  );  
}

function killTool(){
  undoStorage(); //remove this at some point
  cosmiCanvas.clear();
}

function colorPickerTool(x,y, offCanvas){
  let newColor = cosmiCanvas.get(x, y);  

  if(offCanvas)
    newColor = get(x, y); 

  if(newColor[3] == 0) //if nothing is drawn on selected pixel, then it is selecting BG color
    newColor = BGColor;
  
  if(colorPickOnBG){ 
    BGColor = newColor; // changing BG color
    drawBGColorSwatch();
    return;
  }

  FGColor = newColor; // changing FG color
  drawFGColorSwatch();
}


function drawFGColorSwatch(){ //current color swatch display
  push();
  stroke(1);
  fill(FGColor);
  rectMode(CENTER)
  square(60, 565, 55); 
  pop();
}

function drawBGColorSwatch(){ //current color swatch display
  push();
  stroke(1);
  fill(BGColor);
  rectMode(CENTER)
  square(88, 535, 30); 
  pop();

  cosmiBackground.background(BGColor);
}

function saveDrawing(){ //merges bg and fg layer into final saved output
  var tempImg = createImage(cosmiBackground.width, cosmiBackground.height);
  tempImg.copy(cosmiBackground, 0, 0, cosmiBackground.width, cosmiBackground.height, 0, 0, cosmiBackground.width, cosmiBackground.height);
  tempImg.copy(cosmiCanvas, 0, 0, cosmiCanvas.width, cosmiCanvas.height, 0, 0, cosmiCanvas.width, cosmiCanvas.height);

  tempImg.save('your beautiful cosmic craft', 'png');

  //saveCanvas(cosmiCanvas, 'your beautiful cosmic craft without the bg', 'png');
}

