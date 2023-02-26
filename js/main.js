import {visualisointi} from "./visualisointi.js"
import {preparation} from "./valmistelu.js"
let monthlyData;

window.addEventListener('load',()=>{
    newView()
    document.addEventListener('keydown',(e)=>{
        if(key=='arrowUp'||key=='arrowDown'){
            newView(e);
        }
    });
});


function newView(date=new Date()){

//valmistellaan uusi satsi dataa, jos kyseessa ei ole kalenterin paiva
if(!monthlyData||monthlyData.getMonth()!=date.getMonth()){
    preparation(date)
    .then((data)=>{
        monthlyData=data;
        visualisointi(data,date);
    });
    }
else{//muuten tehdaan datella uusi visualisointi ilman data uudestaan alustamista. 
    visualisointi(date);
}
}
