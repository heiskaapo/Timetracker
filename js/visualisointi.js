export function visualisointi(parts,date=Object.keys(parts)[0]){
    let blocks=blocker(280);
    BlockColorer(blocks,parts,date);
    categoryAdder(parts,date);
    // return blocks;
}

function blocker(n){
    let circleLeft=360;
    let blocks=[];
    let cssRoot=document.querySelector(':root'); 
    let blockBorderLength=borderSizeCalculator(n);
    cssRoot.style.setProperty('--triangleBottom',`${blockBorderLength}px`);
    let clockFrame=document.querySelector("#clock");
    let i=0;
    while(circleLeft>degreePerBlock(n)-0.01){
        let newBlock=document.createElement('div');
        newBlock.classList.add('block');
        newBlock.style.transform=`rotate(${i*degreePerBlock(n)}deg)`;
        clockFrame.appendChild(newBlock);
        blocks.push(newBlock);
        circleLeft-=degreePerBlock(n);
        i++;
    }
    return blocks;
}
function BlockColorer(blocks,parts,date){
    parts[date].forEach(element => {
        let startN=Math.floor(element.lengths[0]*blocks.length);//startN is the block number where the activity starts
        let endN=Math.floor(element.lengths[1]*blocks.length);//endN is the block number where the activity ends
        for (let i = startN; (i < endN)&&(i!=blocks.length); i++) {
            let block = blocks[i];
            block.style.borderBottomColor=element.color;
        }
    });
}
function borderSizeCalculator(partAmount){
    let res=Math.tan(Math.PI/partAmount)*180;
    return res;
}
function degreePerBlock(n){
    let res=360/n;
    return res;
}
//function that add to the '#category-list' element list items with the content: element.activityType:TotalElementTime[activityType]'
function categoryAdder(parts,date){
    let dayObject=parts[date];
    let categoryTimes=categoryTimeCalculator(parts,date);
    addLiItems(dayObject,categoryTimes);
}
//function that returns the color of the category that has the same color as the block

//function that adds li items with the content categoryTimes[i].activityType:Math.floor(100*categoryTimes[i].time)+'%'
function addLiItems(dayObject,categoryTimes){
    let categoryList=document.querySelector('#category-list');
    for (let i = 0; i < categoryTimes.length; i++) {
        //calculate the color of the category
        let categoryColor=categoryColorCreator(dayObject,categoryTimes[i]);
        //add li element to the category-list element
        let li=document.createElement('li');
        li.innerHTML=categoryTimes[i].activityType+':'+rounder(categoryTimes[i].time)+'%';
        //add a category color to the li element
        li.style.color=categoryColor;
        categoryList.appendChild(li);

        //make the li element and the blocks that belong to the category change color back to the category color when the mouse is out of the li element
        li.addEventListener('mouseout',()=>{
            let blocks=document.querySelectorAll('.block');
            blocks.forEach(block => {
                if(block.style.borderBottomColor=='red'){
                    block.style.borderBottomColor=categoryColor;
                    li.style.color=categoryColor;
                }
            });
        });
        
        //make the li element and the blocks that belong to the category change color to red when the mouse is over it
        
        li.addEventListener('mouseover',()=>{
            let blocks=document.querySelectorAll('.block');
            blocks.forEach(block => {
                if(spaceRemover(block.style.borderBottomColor)==spaceRemover(categoryColor)){
                    block.style.borderBottomColor='red';
                    li.style.color='red';
                }
            });
        }
        )
    }
}

function categoryColorCreator(dayObject,categoryItem){
    let res;
    dayObject.forEach(element => {
        if(element.activityType==categoryItem.activityType){
            res=element.color;
        }
    });
    return res;
}



function categoryTimeCalculator(parts,date){
    let categories=[];
    parts[date].forEach(element => {
        let category=categories.find((category)=>category.activityType==element.activityType);
        if(category){
            category.time+=element.lengths[1]-element.lengths[0];
        }else{
            categories.push({activityType:element.activityType,time:element.lengths[1]-element.lengths[0]});
        }
    });
    return categories;
}

//function that takes decimal value and returns rounds percentage value up if the decimal value is 0.5 or more and down if the decimal value is less than 0.5
function rounder(decimal){
    let res=Math.floor(decimal*100);
    if(decimal*100-res>=0.5){
        res++;
    }
    return res;
}

//function that takes a string and removes spaces from the string
function spaceRemover(string){
    let res=string.replace(/\s/g, '');
    return res;
}