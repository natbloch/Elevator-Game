//---------Set up functions------------

//--Show numbers next to range
const showElev = (val) => {
    document.querySelector('.elevatoroutput').innerHTML=val; 
}

const showFloors = (val) => {
    document.querySelector('.flooroutput').innerHTML=val; 
}

var elevnum = 5;
var floornum = 10;
var elevobj = [];
var queue = [];


//--Submit
document.querySelector("#setForm").addEventListener("submit", function(e){
    e.preventDefault();
    elevnum = document.querySelector('#elevatorsnumber').value;
    floornum = document.querySelector('#floorsnumber').value;
    setGame(elevnum,floornum);
});


//--------------Set Game---------------
const setGame = (elevnum,floornum) => {
    //Setup Grid
    var gamectr_html = "";
    var elevobj_html = "";
    var first_row = true;

    for(let i = floornum*1+1; i >= 1; i--){
        if(first_row){
            gamectr_html += '<div class="floorlvl floor' + i + '">   <span></span>   ';
        }else{
            gamectr_html += '<div class="floorlvl floor' + i + '">   <span>' + ((i<=1) ? "G" : (i-1)) + '</span>   ';
        }

        for(let k = 1; k <= elevnum; k++){
            gamectr_html += '<div class="elevcol elev' + k + '"></div>  ';
        }

        if(first_row){
            gamectr_html += '</div>';
            first_row = false;
        }else{
            gamectr_html += '<button class="callbutton" onclick="callElev(' + i + ')">Call</button> </div>';
        }
    }

    for(let k = 0; k < elevnum; k++){
        elevobj_html += '<div class="elevobj elevobj' + k + '" style="left:' + (90+(k)*161) + 'px"><img src="./elevicon.svg" alt=""></div>';
        elevobj.push(new Lift(k));
    }
    gamectr_html += elevobj_html;
    document.querySelector('.game-ctr').innerHTML = gamectr_html;
}




//-------------Lift Class--------------
class Lift {
    constructor(number) {
        this.number = number;
        this.floor = 1;
        this.busy = false;
    }

    goToFloor(floor){
        this.floor = floor;
    }

    makeBusy(){
        this.busy = true;
    }

    makeAvailable(){
        this.busy = false;
    }

    getFloorDif(floorReq){
        return Math.abs(floorReq-this.floor);
    }
}

setGame(elevnum,floornum);



//-----------Operation Functions-----------------

const callElev = (floor) => {
    
    //--Button in waiting mode
    let button = document.querySelector(".floor" + floor + " .callbutton");
    button.classList.add("waiting");
    button.innerHTML="Waiting";
    button.disabled="true";
    
    if(queue.length > 0){ //--Add to queue in last position
        queue.push(floor);
    }else{
        //--Check which lift is available & sort with the closest one first
        let availableElev = elevobj.filter((lift) => { return (lift.busy == false && lift.floor != floor)});
        if(availableElev.length > 0){
            let selectElev = availableElev.sort((a,b) => { return a.getFloorDif(floor) - b.getFloorDif(floor) });
            moveElevator(selectElev[0].number,floor);
        }else{
            queue.push(floor);
        }        
    }    
}

const moveElevator = (elevno,floor) => {
    //How many floor will the elevator go through
    let oldfloor = elevobj[elevno].floor;
    let newfloor = floor;
    //console.log(oldfloor);  console.log(newfloor);

    let floordif = elevobj[elevno].getFloorDif(floor);
    console.log(floordif);
    //Time it will take: not linear - 2s for start and arrive (*2) + 2s per floor
    let rideTime = 4 + 2*floordif;

    //Change elevator class status
    elevobj[elevno].makeBusy();    
    elevobj[elevno].goToFloor(floor);
    

    //Make elevator red - start clock(calculate time) - go
    document.querySelector(".elevobj"+elevno).classList.add("busy");
    //document.querySelector(".elevobj"+elevno).style.bottom = ((floor-1)*90+15)+"px";
    document.querySelector(".elevobj"+elevno).style.transform = "translateY("+(-(newfloor-1)*90)+"px)";
    document.querySelector(".elevobj"+elevno).style.transition = rideTime+"s  cubic-bezier(0.42, 0.03, 0.58, 0.99)";
    let rideTimeFormat = (rideTime >= 60 ) ? (Math.floor(rideTime/60)+"min "+(rideTime%60)+"s") : (rideTime+"s");

    //Change Button to arrived
    let button = document.querySelector(".floor" + floor + " .callbutton");
    setTimeout(() => {
        let audio = new Audio('./elevbeep.mp3');
        audio.play();
        button.classList.remove("waiting");
        button.classList.add("arrived");
        button.innerHTML="Arrived";
        document.querySelector(".elevobj"+elevno).classList.remove("busy");
        document.querySelector(".elevobj"+elevno).classList.add("arrived");
        document.querySelector(".floor"+(floor+1)+" .elev"+(elevno+1)).innerHTML = rideTimeFormat;
        console.log("gonna call");
        elevAgainFree(elevno,floor)
    }, rideTime*1000);
}

const elevAgainFree = (elevno,floor) => {
    setTimeout(() => {
        console.log("called");
        //Release button for floor & erase clock
        let button = document.querySelector(".floor" + floor + " .callbutton");
        button.classList.remove("arrived");
        button.innerHTML="Call";
        button.removeAttribute('disabled');
        document.querySelector(".floor"+(floor+1)+" .elev"+(elevno+1)).innerHTML = "";
        
        //For the elevator - Check if there is a queue and make available or go to serve next in queue
        if(queue.length > 0){ 
            let nextInQueue = queue.shift();//return and remove first 
            console.log("next: ", nextInQueue);
            moveElevator(elevno,nextInQueue);
        }else{//Make Elevator free again
            document.querySelector(".elevobj"+elevno).classList.remove("arrived");
            elevobj[elevno].makeAvailable();
        } 
    }, 2000);          
}

