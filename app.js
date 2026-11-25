const db=JSON.parse(localStorage.getItem('fitness-db'))||{
workouts:[],
foods:[],
weights:[],
personalRecords:{},
volumePRs:{},
badges:[]
};

const exerciseStats = {
    personalRecords:{},
    volumeRecords:{},
    oneRMRecords:{}
};

const exerciseDatabase = {

Chest:[
"Bench Press",
"Incline Bench",
"Decline Bench",
"Dumbbell Press",
"Cable Fly",
"Pec Deck",
"Dips"
],

Back:[
"Pull Up",
"Lat Pulldown",
"Barbell Row",
"Cable Row",
"T Bar Row",
"Rack Pull"
],

Shoulders:[
"Military Press",
"Arnold Press",
"Lateral Raise",
"Front Raise",
"Rear Delt Fly"
],

Biceps:[
"Barbell Curl",
"Hammer Curl",
"Preacher Curl",
"Cable Curl"
],

Triceps:[
"Pushdown",
"Skull Crusher",
"Dips",
"Overhead Extension"
],

Legs:[
"Squat",
"Front Squat",
"Leg Press",
"Leg Extension",
"Ham Curl",
"Calf Raise",
"RDL"
]

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

function populateExerciseDatabase(){

    const selector =
    document.getElementById(
        'exerciseSelector'
    );

    selector.innerHTML='';

    Object.values(
        exerciseDatabase
    )
    .flat()
    .sort()
    .forEach(exercise=>{

        selector.innerHTML+=`

        <option>

        ${exercise}

        </option>

        `;

    });

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

function getLastExerciseSets(exercise){

    for(let i=db.workouts.length-1;i>=0;i--){

        const found =
        db.workouts[i].exercises.find(
            e=>e.name===exercise
        );

        if(found && found.sets){

            return found.sets;

        }

    }

    return null;

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

        const suggestion =
        suggestedWeight(exercise);

        const previousSets =
        getLastExerciseSets(exercise);

        const card =
        document.createElement('div');

        card.className='exercise-card';

        card.innerHTML=`

        <h3>${exercise}</h3>

        <button class="removeExerciseBtn">
        Remove Exercise
        </button>

        <div class="previous-performance">

            Previous:
            ${history}

        </div>

        <div class="previous-performance">

            Suggested:
            ${
                suggestion
                ? suggestion + ' lbs'
                : 'Use a comfortable weight'
            }

        </div>
        
        <div class="set-row-header">

            <span>Set</span>

            <span>Weight</span>

            <span>Reps</span>

        </div>

        <div class="sets">

            <div class="set-row">
                <span>1</span>

                <input
                    class="weight"
                    placeholder="Weight"
                    value="${previousSets?.[0]?.weight || ''}"
                >

                <input
                    class="reps"
                    placeholder="Reps"
                    value="${previousSets?.[0]?.reps || ''}"
                >
            </div>

            <div class="set-row">
                <span>2</span>

                <input
                    class="weight"
                    placeholder="Weight"
                    value="${previousSets?.[1]?.weight || ''}"
                >

                <input
                    class="reps"
                    placeholder="Reps"
                    value="${previousSets?.[1]?.reps || ''}"
                >
            </div>

            <div class="set-row">
                <span>3</span>

                <input
                    class="weight"
                    placeholder="Weight"
                    value="${previousSets?.[2]?.weight || ''}"
                >

                <input
                    class="reps"
                    placeholder="Reps"
                    value="${previousSets?.[2]?.reps || ''}"
                >
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

                <input class="weight">
                <input class="reps">

            `;

            setsContainer
            .appendChild(row);

        };
        document
        .querySelectorAll(
        '.removeExerciseBtn'
        )
        .forEach(btn=>{

            btn.onclick=()=>{

                btn
                .closest(
                '.exercise-card'
                )
                .remove();

            };

        });

    });

}

function renderSavedWorkouts(){

    const container =
    document.getElementById(
        'savedWorkouts'
    );

    if(!container) return;

    container.innerHTML='';

    db.workouts
    .slice()
    .reverse()
    .forEach((workout,index)=>{

        container.innerHTML += `

        <div class="history-card">

            <strong>

            ${new Date(
                workout.date
            ).toLocaleDateString()}

            </strong>

            <br>

            ${workout.split}

            <br><br>

            <button
                onclick="deleteWorkout(${db.workouts.length-1-index})"
            >

                Delete Workout

            </button>
            <button
            onclick="editWorkout(${db.workouts.length-1-index})"
            >
            Edit
            </button>


        </div>

        `;

    });

}

function editWorkout(index){

    const workout =
    db.workouts[index];

    document
    .querySelectorAll(
    '.page'
    )
    .forEach(
        p=>p.classList.remove(
            'active'
        )
    );

    document
    .getElementById(
        'workout'
    )
    .classList.add(
        'active'
    );

    const container =
    document.getElementById(
        'workoutContainer'
    );

    container.innerHTML='';

    workout.exercises.forEach(
        exercise=>{

            addExerciseCard(
                exercise.name
            );

        }
    );

}

function deleteWorkout(index){

    const confirmed =
    confirm(
        'Delete workout?'
    );

    if(!confirmed) return;

    db.workouts.splice(
        index,
        1
    );

    save();

    refreshDashboard();

    renderCalendar();

    renderSavedWorkouts();

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

        if(!db.volumePRs){
            db.volumePRs = {};
        }

        if(
            !db.volumePRs[name] ||
            volume > db.volumePRs[name]
        ){
            db.volumePRs[name] = volume;
        }

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
    renderCalendar();
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

function calculateCurrentStreak(){

    if(db.workouts.length === 0){
        return 0;
    }

    const workoutDays = [...new Set(
        db.workouts.map(w =>
            new Date(w.date)
            .toDateString()
        )
    )];

    workoutDays.sort(
        (a,b)=> new Date(b)-new Date(a)
    );

    let streak = 1;

    for(let i=1;i<workoutDays.length;i++){

        const current =
        new Date(workoutDays[i-1]);

        const previous =
        new Date(workoutDays[i]);

        const diff =
        (current - previous) /
        (1000*60*60*24);

        if(diff===1){
            streak++;
        }else{
            break;
        }
    }

    return streak;
}

function longestStreak(){

    if(db.workouts.length===0){
        return 0;
    }

    const days = [...new Set(
        db.workouts.map(w =>
            new Date(w.date)
            .toDateString()
        )
    )];

    days.sort(
        (a,b)=>new Date(a)-new Date(b)
    );

    let longest=1;
    let current=1;

    for(let i=1;i<days.length;i++){

        const diff=
        (new Date(days[i])-
         new Date(days[i-1]))
        /(1000*60*60*24);

        if(diff===1){

            current++;

            longest=Math.max(
                longest,
                current
            );

        }else{

            current=1;

        }

    }

    return longest;
}

function checkAchievements(){

    const earned=[];

    if(db.workouts.length>=10){

        earned.push(
        '🥉 10 Workouts'
        );

    }

    if(db.workouts.length>=50){

        earned.push(
        '🥈 50 Workouts'
        );

    }

    if(db.workouts.length>=100){

        earned.push(
        '🥇 100 Workouts'
        );

    }

    if(calculateCurrentStreak()>=7){

        earned.push(
        '🔥 7 Day Streak'
        );

    }

    if(calculateCurrentStreak()>=30){

        earned.push(
        '🔥 30 Day Streak'
        );

    }

    db.badges = earned;

}

function renderBadges(){

    const container =
    document.getElementById(
        'badgeContainer'
    );

    if(!container) return;

    container.innerHTML='';

    db.badges.forEach(badge=>{

        container.innerHTML += `

        <div class="history-card">

            ${badge}

        </div>

        `;

    });

}


function refreshDashboard(){
currentWeight.textContent=db.weights.at(-1)?.weight||0;
workoutCount.textContent=db.workouts.length;
streak.textContent=
calculateCurrentStreak();

monthlyVolume.textContent =
monthlyVolume();

estimatedTime.textContent =
estimateWorkoutTime();

bestStreak.textContent=
longestStreak();

const today=new Date().toDateString();
const calories=db.foods
.filter(x=>new Date(x.date).toDateString()===today)
.reduce((a,b)=>a+b.calories,0);

caloriesToday.textContent=calories;
recommendedWorkout.innerHTML=`<h3>${nextSplit()} Day Recommended</h3>`;
renderPRs();
checkAchievements();
renderBadges();
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

function renderCalendar(){

    const grid =
    document.getElementById(
        'calendarGrid'
    );

    if(!grid) return;

    grid.innerHTML='';

    db.workouts.forEach(workout=>{

        let color='#999';

        if(workout.split==='Push'){
            color='#ef4444';
        }

        if(workout.split==='Pull'){
            color='#3b82f6';
        }

        if(workout.split==='Legs'){
            color='#22c55e';
        }

        grid.innerHTML += `

        <div
            class="calendar-day"
            style="
                background:${color};
                color:white;
                padding:10px;
                margin:5px;
                border-radius:10px;
            "
        >

        ${new Date(
          workout.date
        ).toLocaleDateString()}

        <br>

        ${workout.split}

        </div>

        `;

    });

}

function drawCharts(){
if(!db.weights.length)return;
const ctx=document.getElementById('weightChart');
new Chart(ctx,{type:'line',data:{labels:db.weights.map(x=>x.date.slice(0,10)),datasets:[{label:'Weight',data:db.weights.map(x=>x.weight)}]}});
}

function populateHistoryDropdown(){

    const dropdown =
    document.getElementById(
        'historyExercise'
    );

    const exercises =
    new Set();

    db.workouts.forEach(workout=>{

        workout.exercises.forEach(ex=>{

            exercises.add(ex.name);

        });

    });

    dropdown.innerHTML='';

    [...exercises]
    .sort()
    .forEach(ex=>{

        dropdown.innerHTML += `
        <option>${ex}</option>
        `;

    });

}

function addExerciseCard(exercise){

    const container =
    document.getElementById(
        'workoutContainer'
    );

    const card =
    document.createElement(
        'div'
    );

    card.className =
    'exercise-card';

    card.innerHTML=`

    <h3>${exercise}</h3>

    <button
       class="removeExercise"
    >
       Remove
    </button>

    <div class="sets">

      <div class="set-row">

         <span>1</span>

         <input
          class="weight"
          placeholder="Weight"
         >

         <input
          class="reps"
          placeholder="Reps"
         >

      </div>

      <div class="set-row">

         <span>2</span>

         <input
          class="weight"
          placeholder="Weight"
         >

         <input
          class="reps"
          placeholder="Reps"
         >

      </div>

      <div class="set-row">

         <span>3</span>

         <input
          class="weight"
          placeholder="Weight"
         >

         <input
          class="reps"
          placeholder="Reps"
         >

      </div>

    </div>

    <button class="add-set-btn">

       + Add Set

    </button>

    `;

    container.appendChild(
        card
    );

}

function estimateWorkoutTime(){

    const last =
    db.workouts.at(-1);

    if(!last){

        return "45 min";

    }

    const exerciseCount =
    last.exercises.length;

    const estimated =
    (exerciseCount * 8);

    return estimated
    + " min";

}

function monthlyVolume(){

    const month =
    new Date().getMonth();

    let volume=0;

    db.workouts.forEach(
        workout=>{

            const date=
            new Date(
            workout.date
            );

            if(
             date.getMonth()
             === month
            ){

                workout.exercises
                .forEach(ex=>{

                    volume +=
                    ex.volume || 0;

                });

            }

        }
    );

    return volume;

}

function showExerciseHistory(){

    const exercise=
    historyExercise.value;

    const results =
    document.getElementById(
        'historyResults'
    );

    results.innerHTML='';

    db.workouts
    .slice()
    .reverse()
    .forEach(workout=>{

        const found=
        workout.exercises.find(
            e=>e.name===exercise
        );

        if(!found) return;

        results.innerHTML += `

        <div class="history-card">

            <strong>
            ${new Date(workout.date)
              .toLocaleDateString()}
            </strong>

            <br>

            ${
              found.sets
              .map(
                s=>`${s.weight} × ${s.reps}`
              )
              .join('<br>')
            }

            <br><br>

            Volume:

            ${found.volume}

        </div>

        `;

    });

}

document
.getElementById(
'addExerciseBtn'
)
.onclick=()=>{

    const exercise =
    exerciseSelector.value;

    addExerciseCard(
        exercise
    );

};

document.getElementById(
    'historyExercise'
).addEventListener(
    'change',
    showExerciseHistory
);

function suggestedWeight(exercise){

    const previous =
    getLastExerciseSets(exercise);

    if(!previous)
        return null;

    let lastWeight =
    previous[0].weight;

    let averageReps =

    previous.reduce(
        (sum,set)=>
        sum+Number(set.reps),
        0
    ) /
    previous.length;

    if(averageReps >= 8){

        return lastWeight + 5;

    }

    return lastWeight;

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
populateHistoryDropdown();
drawCharts();
renderCalendar();
renderSavedWorkouts();
populateExerciseDatabase();
