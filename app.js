const db=JSON.parse(localStorage.getItem('fitness-db'))||{
workouts:[],
foods:[],
weights:[],
personalRecords:{},
badges:[]
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

function generateWorkout(){
const split=nextSplit();
const template=workouts[split][Math.floor(Math.random()*workouts[split].length)];
const container=document.getElementById('workoutContainer');
container.innerHTML='';

container.dataset.split=split;

template.forEach(ex=>{
const history=findHistory(ex);
container.innerHTML+=`
<div class="exercise-card">
<h3>${ex}</h3>
<p>Last: ${history}</p>
<input class="weight" placeholder="Weight">
<input class="reps" placeholder="Reps">
</div>`;
});
}

function findHistory(exercise){
for(let i=db.workouts.length-1;i>=0;i--){
 const hit=db.workouts[i].exercises.find(e=>e.name===exercise);
 if(hit)return `${hit.weight} x ${hit.reps}`;
}
return 'No History';
}

function estimate1RM(weight,reps){
return Math.round(weight*(1+reps/30));
}

document.getElementById('generateWorkout').onclick=generateWorkout;

document.getElementById('saveWorkout').onclick=()=>{
const exercises=[];

document.querySelectorAll('.exercise-card').forEach(card=>{
const name=card.querySelector('h3').innerText;
const weight=Number(card.querySelector('.weight').value||0);
const reps=Number(card.querySelector('.reps').value||0);

exercises.push({name,weight,reps});

const currentPR=db.personalRecords[name]||0;
if(weight>currentPR){
 db.personalRecords[name]=weight;
}
});

const workout={
date:new Date().toISOString(),
split:document.getElementById('workoutContainer').dataset.split,
exercises
};

db.workouts.push(workout);
awardBadges();
save();
refreshDashboard();
alert('Workout saved');
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
const list=document.getElementById('prList');
list.innerHTML='';
Object.entries(db.personalRecords).forEach(([name,value])=>{
 list.innerHTML+=`<div>${name}: ${value} lbs</div>`;
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
