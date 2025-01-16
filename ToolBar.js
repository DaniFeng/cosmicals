class ToolBar {
  constructor(x, y, size, iconsTxtFile) {
    this.x = x; //starting X coordinate of first icon
    this.y = y; //starting Y coordinate of first icon
    this.size = size; //how many pixels the icon is
    this.data = loadStrings(iconsTxtFile); //array of images for the icons     
    this.icons = []
  }

  loadIcons(){
    this.data.forEach((element) => this.icons.push(createImg(element))); //converts img urls to images
  }

  grab(index){
    return this.icons[index];
  }

  show() { // makes Toolbar icons appear for selected tool
    for(let i = 0 ; i < this.icons.length ; i++){
      this.icons[i].position(this.x + i*this.size, this.y); //image(this.icons[i], this.x + i*this.size, this.y);
      
    }

  /*    
    if(currentTool == 1){ //display depending on tool //fix this lmao
      drawSlider.position(125, 10);
      brushSize = drawSlider.value();
  
    } else if (currentTool == 2){
      //drawSlider.remove();
  
      eraseSlider.position(125, 10);
      eraserSize = eraseSlider.value();
    }   */

  }

  hide() { //hides Toolbar when a new Toolbar has to be put in

  }
}
