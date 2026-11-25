const db=JSON.parse(localStorage.getItem('fitness-db'))||{
workouts:[],
foods:[],
weights:[],
personalRecords:{},
badges:[]
};

const exerciseStats = {
    personalRecords:{},
    volumeRecords:{},
    oneRMRecords:{}
};

const workouts={

Push:[
['Bench Press','Incline DB Press','Shoulder Press','Lateral Raise','Tricep Pushdown'],
['Incline Bench','Dumbbell Press','Arnold Press','Cable Fly','Overhead Extension']
],
Pull:[
['Deadlift','Barbell Row','Lat Pulldown','Face Pull','Hammer Curl'],
['Rack Pull','Cable Row','Pullups','Rear Delt Fly','EZ Curl']
],
Legs:[
['Squat','Leg Press','Romanian Deadlift','Leg Curl','Calf Raise'],
['Front Squat','Bulgarian Split Squat','Leg Extension','Ham Curl','Seated Calf Raise']
]
};

function save(){
localStorage.setItem('fitness-db',JSON.stringify(db));
}

function nextSplit(){
const last=db.workouts.at(-1);
if(!last)return 'Push';
if(last.split==='Push')return 'Pull';
if(last.split==='Pull')return 'Legs';
return 'Push';
}

function estimate1RM(weight,reps){
    return Math.round(weight * (1 + reps/30));
}

function calculateVolume(sets){

    let volume = 0;

    sets.forEach(set=>{

        volume +=
        Number(set.weight || 0) *
        Number(set.reps || 0);

    });

    return volume;
}

function lastExercisePerformance(exercise){

    for(let i=db.workouts.length-1;i>=0;i--){

        const found =
        db.workouts[i].exercises.find(
            e=>e.name===exercise
        );

        if(found){

            if(found.sets){

                return found.sets
                .map(
                    s=>`${s.weight}x${s.reps}`
                )
                .join(", ");

            }

        }

    }

    return "No previous workout";
}

function generateWorkout(){

    const split = nextSplit();

    const template =
    workouts[split][
      Math.floor(Math.random()*
      workouts[split].length)
    ];

    const container =
    document.getElementById(
        'workoutContainer'
    );

    container.innerHTML='';

    container.dataset.split=split;

    template.forEach(exercise=>{

        const history =
        lastExercisePerformance(exercise);

        const card =
        document.createElement('div');

        card.className='exercise-card';

        card.innerHTML=`

        <h3>${exercise}</h3>

        <div class="previous-performance">

            Previous:
            ${history}

        </div>

        <div class="sets">

            <div class="set-row">
                <span>1</span>
                <input class="weight" placeholder="Weight (lbs)">
                <input class="reps" placeholder="Reps">
            </div>

            <div class="set-row">
                <span>2</span>
                <input class="weight" placeholder="Weight (lbs)">
                <input class="reps" placeholder="Reps">
            </div>

            <div class="set-row">
                <span>3</span>
                <input class="weight" placeholder="Weight (lbs)">
                <input class="reps" placeholder="Reps">
            </div>

        </div>

        <button class="add-set-btn">
            + Add Set
        </button>

        `;

        container.appendChild(card);

    });

    document
      .querySelectorAll('.add-set-btn')
      .forEach(btn=>{

        btn.onclick=()=>{

            const setsContainer =

            btn.parentElement
            .querySelector('.sets');

            const count =
                setsContainer
                .querySelectorAll('.set-row')
                .length + 1;

            const row =
            document.createElement('div');

            row.className='set-row';

            row.innerHTML=`

            <span>${count}</span>

            <input class="weight" placeholder="Weight (lbs)">
            <input class="reps" placeholder="Reps">

            `;

            setsContainer
            .appendChild(row);

        };

    });

}

function findHistory(exercise){
for(let i=db.workouts.length-1;i>=0;i--){
 const hit=db.workouts[i].exercises.find(e=>e.name===exercise);
 if(hit)return `${hit.weight} x ${hit.reps}`;
}
return 'No History';
}

document.getElementById('generateWorkout').onclick=generateWorkout;

document.getElementById(
'saveWorkout'
).onclick=()=>{

    const exercises=[];

    document
    .querySelectorAll(
        '.exercise-card'
    )
    .forEach(card=>{

        const name =
        card.querySelector(
            'h3'
        ).innerText;

        const sets=[];

        card.querySelectorAll(
            '.set-row'
        )
        .forEach(row=>{

            const weight =
            Number(
            row.querySelector(
                '.weight'
            ).value || 0
            );

            const reps =
            Number(
            row.querySelector(
                '.reps'
            ).value || 0
            );

            sets.push({
                weight,
                reps
            });

        });

        const volume =
        calculateVolume(sets);

        let exercisePR = false;

        sets.forEach(set=>{

            if(
            !db.personalRecords[name] ||
            set.weight >
            db.personalRecords[name]
            ){

                db.personalRecords[name] =
                set.weight;

                exercisePR=true;
            }

        });

        exercises.push({

            name,

            sets,

            volume,

            exercisePR

        });

    });

    db.workouts.push({

        date:
        new Date()
        .toISOString(),

        split:
        workoutContainer
        .dataset
        .split,

        exercises

    });

    save();

    refreshDashboard();

    alert(
      'Workout Saved'
    );

};

document.getElementById('addFood').onclick=()=>{
const item={
name:foodName.value,
calories:+foodCalories.value,
protein:+foodProtein.value,
carbs:+foodCarbs.value,
fat:+foodFat.value,
date:new Date().toISOString()
};

db.foods.push(item);
save();
refreshDashboard();
};

document.getElementById('saveWeight').onclick=()=>{
 db.weights.push({
 date:new Date().toISOString(),
 weight:+bodyWeight.value
 });
 save();
 drawCharts();
 refreshDashboard();
};

function awardBadges(){
if(db.workouts.length===10 && !db.badges.includes('10 Workouts')){
 db.badges.push('10 Workouts');
}
}

function refreshDashboard(){
currentWeight.textContent=db.weights.at(-1)?.weight||0;
workoutCount.textContent=db.workouts.length;
streak.textContent=db.workouts.length;

const today=new Date().toDateString();
const calories=db.foods
.filter(x=>new Date(x.date).toDateString()===today)
.reduce((a,b)=>a+b.calories,0);

caloriesToday.textContent=calories;
recommendedWorkout.innerHTML=`<h3>${nextSplit()} Day Recommended</h3>`;
renderPRs();
}

function renderPRs(){

    const list =
    document.getElementById(
        'prList'
    );

    list.innerHTML='';

    Object.entries(
        db.personalRecords
    )
    .forEach(([name,pr])=>{

        list.innerHTML += `

        <div class="history-card">

            <h3>${name}</h3>

            <p>

            Weight PR:

            ${pr} lbs

            </p>

        </div>

        `;

    });

}

function drawCharts(){
if(!db.weights.length)return;
const ctx=document.getElementById('weightChart');
new Chart(ctx,{type:'line',data:{labels:db.weights.map(x=>x.date.slice(0,10)),datasets:[{label:'Weight',data:db.weights.map(x=>x.weight)}]}});
}

document.querySelectorAll('nav button').forEach(btn=>{
btn.addEventListener('click',()=>{
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 document.getElementById(btn.dataset.page).classList.add('active');
});
});

document.getElementById('themeToggle').onclick=()=>{
 document.body.classList.toggle('dark');
};

document.getElementById('exportData').onclick=()=>{
const blob=new Blob([JSON.stringify(db)],{type:'application/json'});
const a=document.createElement('a');
a.href=URL.createObjectURL(blob);
a.download='fitness-backup.json';
a.click();
};

if('serviceWorker' in navigator){
navigator.serviceWorker.register('service-worker.js');
}

refreshDashboard();
drawCharts();
