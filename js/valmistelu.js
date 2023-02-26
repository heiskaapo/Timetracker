export function preparation(date){
    return new Promise((resolve)=>{
        //wait for all the data to be ready, then resolve 
        let movementApiCall=createApiCall('movement',date);
        let desktopApiCall=createApiCall('computer',date);
        Promise.all([fetchAndFunc(movementApiCall),fetchAndFunc(desktopApiCall)])
        .then((categoryObjects)=>{
            //combine categoryObjects, and create one portion 
            // resolve(combineCategories(categoryObjects));
        })
    })
}

function computerDataCreator(data){//calculate the computer usage for the given date}
    console.log(data);
    let prevtype;
    let computerData={};
    data.forEach(element => {
        let year=new Date(element.timestamp).getFullYear();
        let month=new Date(element.timestamp).getMonth()+1;
        let date=new Date(element.timestamp).getDate();
        let hour=new Date(element.timestamp).getHours();
        let minute=new Date(element.timestamp).getMinutes();
        let second=new Date(element.timestamp).getSeconds();
        
        let start=(hour*3600+minute*60+second)/86400;
        let end=(hour*3600+minute*60+second+element.duration)/86400;
        let lengths=[start,end];
        let activityType=element.data.status;
        let key=year+'-'+month+'-'+date;
        
        if(!computerData[key]){
            computerData[key]=[];
        }
        if(computerData[key].hasOwnProperty('0')&&prevtype==activityType){
            try{computerData[key][computerData[key].length-1].lengths=[start,end];}
            catch(e){
                console.log(computerData[key]);
            }
        }
        else if(activityType=='not-afk'){
            let activityObject={
                activityType:activityType,
                lengths:lengths,
                color:stringToColor(activityType),
            }
            computerData[key].push(activityObject);
        }//if the previous activity is the same as the current one, don't create a new object, but change the length of the previous one

        prevtype=activityType;
        
        
    });
    return computerData;
}


//fetch and do this function for the data, return a activityCategory
function fetchAndFunc(apiCall){
    let parseFunct;
    if(apiCall.match(/aw-watcher-afk_LAPTOP/)){//jos on computer haku
        parseFunct=computerDataCreator;
    }
    if(apiCall.match(/2022_/)){//jos on movemethaku
        parseFunct=activityDataCreator;
    }
    
    return new Promise((resolve)=>{
        fetch(apiCall)
        .then((response)=>response.json())
        .then((response)=>{
        let res=parseFunct(response);
        console.log(res);
        resolve(res);//return a promise, that contains the data 
    })
    })
}
function createApiCall(requestName,date){
    let sampleApi;
    if(requestName=='computer'){
        sampleApi='http://localhost:5600/api/0/buckets/aw-watcher-afk_LAPTOP-EFFG1A8D/events?end=END&start=START';
        let start=new Date(date.getFullYear(),date.getMonth(),1,0,0,0);//added two hours more, because toISOString turns back to utc
        let end=new Date(date.getFullYear(),date.getMonth()+1,0,23,59,59);//added two hours because to ISOSring turns back to utc
        
        sampleApi=sampleApi.replace('START',start.toISOString()).replace('END',end.toISOString());
        return sampleApi;
        }

    else if(requestName=='movement'){
        sampleApi= './data/'+date.getFullYear()+'_'+monthToString(date.getMonth()+1)+'.json';   
    }
    return sampleApi;
    }


    function activityDataCreator(data){
        let activitySegments=parseMovementActivities(data);//parseMovementActivities returns an array of only activitySegments from the data
        let activityObjects={};
        //activityObjects is an object with date as key and activityObject as value that is returned by the function
        activitySegments.forEach(element => {
            // let endTime=addTwoHours(element.duration.endTimestamp);
            let endTime=new Date(element.duration.endTimestamp);
            let startTime=new Date(element.duration.startTimestamp);
            let continuedThroughMidnight=addTwoHours(endTime)==addTwoHours(startTime);
            // let startTime=addTwoHours(element.duration.startTimestamp);//add two hours to the start and end time because the data is in UTC+0
            let containsDate=activityObjects.hasOwnProperty(createDateforKey(startTime));//test if the date is already in the activityObjects object
            if(!continuedThroughMidnight){//
                if(!containsDate){//
                    activityObjects[createDateforKey(startTime)]=[];
                }
                let activityObject={
                    activityType:element.activityType,
                    lengths:dateToStartAndEndDecimals(element),
                    color:stringToColor(element.activityType),
                    startTime:startTime
                }
                activityObjects[createDateforKey(startTime)].push(activityObject);}
        });
        return activityObjects;
    
    }


function stringToColor(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        sum += str.charCodeAt(i);
    }
    let num=sum % 256;
    //create rgb color from the num
    let color='rgb('+num+',0,'+(255-num)+')';
    return color;
}



//HelperFunctions for the createActivityObjects function


function parseMovementActivities(Data){//parse the data to get only the activitySegments
    let activitySegments=[];
    Data.timelineObjects.forEach(element => {
        if(element.activitySegment){
            activitySegments.push(element.activitySegment);
        }
    });
    return activitySegments;
}
function monthToString(month){//convert the month number to a string
    let months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[month-1].toUpperCase();
}
function addTwoHours(date){//add two hours to the date because the data is in UTC+0
    let newDate=new Date(date);
    newDate.setHours(newDate.getHours()+2);
    return newDate;
}
function dateToStartAndEndDecimals(element){//convert the start and end time to decimals representing the time of the day
    return [new Date(element.duration.startTimestamp).getHours()/24+new Date(element.duration.startTimestamp).getMinutes()/1440,new Date(element.duration.endTimestamp).getHours()/24+new Date(element.duration.endTimestamp).getMinutes()/1440]
}//
function createDateforKey(startDate){//create a date string for the key of the activityObjects object
    let date=new Date(startDate);
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}




