// VERSION 2.0.0

let tasks;
let names;
const boxes = [
    {
        name: 'todo',
        code: '0'
    },
    {
        name: 'assigned',
        code: '1'
    },
    {
        name: 'progress',
        code: '2'
    },
    {
        name: 'finished',
        code: '3'
    },
    {
        name: 'planned',
        code: '5'
    }
];

// get the new data each 5 seconds
setInterval(() => {
    if (!isEditMode()) getData();
}, 5000);

const getData = () => {
    const currentTime = Date.now();
    const getTasksRoute = `https://sar-reg.no/backend/Oppdrag.php?time=${currentTime}`;
    const getNamesRoute = `https://sar-reg.no/backend/OppdragLag.php?time=${currentTime}`;
    $.getJSON(getTasksRoute, {}, tasksList => {
        tasks = tasksList.sort(compare);
        $.getJSON(getNamesRoute, {}, namesList => {
            // remove all tasks boxes on each requests, so we can fill the again
            document.querySelectorAll('.example-draggable').forEach(e => e.remove());

            names = namesList;
            for (const [taskIndex, task] of tasks.entries()) {
                // add the div
                const div = document.createElement('div');
                div.id = `draggable-${taskIndex + 1}`;
                div.classList.add('example-draggable');
                div.draggable = true;
                div.addEventListener('dragstart', onDragStart);

                // add span inside div
                const span = document.createElement('span');
                span.id = `name-${taskIndex + 1}`;
                span.innerHTML = task.hva;
                div.appendChild(span);

                // add select inside div
                const select = document.createElement('select');
                select.id = `select-${taskIndex + 1}`;
                select.classList.add('hide');
                select.addEventListener('change', onSelectClick);

                // create a default empty option
                const emptyOption = document.createElement('option');
                emptyOption.id = '';
                emptyOption.value = '';
                emptyOption.innerHTML = '';
                select.appendChild(emptyOption);
                
                // add options to select
                for (const name of names) {
                    const option = document.createElement('option');
                    option.id = name.id;
                    option.value = name.id;
                    option.innerHTML = name.navn;
                    if (name.id === task.lag) option.setAttribute('selected', true);
                    select.appendChild(option);
                }
                div.appendChild(select);
                
                // add div to the correct box
                const boxName = boxes.find(box => box.code === task.status).name;
                const box = document.getElementById(boxName);
                div.classList.add(`${boxName}-color`);
                if (!['progress', 'finished'].includes(boxName)) div.addEventListener("click", onBoxClick);
                box.appendChild(div);
            }
        });
    });
};

getData();

const compare = (a, b) => {
    if (a.hva < b.hva) return -1;
    if (a.hva > b.hva) return 1;
    return 0;
};

const isEditMode = () => {
    const selects = document.querySelectorAll('[id^="select-"]');
    for (const select of selects) {
        if (select.classList[0] !== 'hide') return true;
    }
    return false;
};

const onBoxClick = event => {
    const id = event.target.id;
    if (id.startsWith('select')) return;
    const idNumber = id.split('-')[1];
    const name = document.getElementById(`name-${idNumber}`);
    const select = document.getElementById(`select-${idNumber}`);
    if (name.classList[0] === 'hide') {
        name.classList.remove('hide');
        select.classList.add('hide');
    } else {
        name.classList.add('hide');
        select.classList.remove('hide');
        const selects = document.querySelectorAll('[id^="select-"]');
        for (const select of selects) {
            if (select.id !== `select-${idNumber}`) {
                const selectIdNumber = select.id.split('-')[1];
                select.classList.add('hide');
                document.getElementById(`name-${selectIdNumber}`).classList.remove('hide');
            }
        }
    }
};

const onSelectClick = event => {
    const id = event.target.id;
    const idNumber = id.split('-')[1];
    const draggableDivId = `draggable-${idNumber}`;
    const draggableDiv = document.getElementById(draggableDivId);
    const nameId = `name-${idNumber}`;
    const name = document.getElementById(nameId);
    const selectId = `select-${idNumber}`;
    const select = document.getElementById(selectId);
    name.classList.remove('hide');
    select.classList.add('hide');
    const parentNodeId = document.getElementById(draggableDivId).parentNode.id;
    if (parentNodeId === 'todo') {
        const dropZone = document.getElementById("assigned");
        dropZone.appendChild(draggableDiv);
    }
    const taskId = tasks.find(task => task.hva === draggableDiv.innerText).id;
    const userId = select.value;
    const statusId = boxes.find(box => box.name === parentNodeId).code;
    const currentTime = Date.now();
    const link = `https://sar-reg.no/backend/OppdragChange.php?id=${taskId}&status=${statusId}&userId=${userId}&time=${currentTime}`;
    $.getJSON(link);
};

const onDragStart = event => {
    event.dataTransfer.setData("text/plain", event.target.id);
    event.currentTarget.style.backgroundColor = "yellow";
};

const onDragOver = event => {
    event.preventDefault();
};

const onDrop = event => {
    const dropZone = event.target;
    const dropZoneId = dropZone.id;
    if (dropZoneId.startsWith('draggable') || dropZoneId.startsWith('name')) {
        if (event.path[1].id.startsWith('draggable')) dropZone = document.getElementById(event.path[2].id);
        else dropZone = document.getElementById(event.path[1].id);
    }
    const id = event.dataTransfer.getData("text");
    const idNumber = id.split('-')[1];
    const draggableDiv = document.getElementById(id);
    dropZone.appendChild(draggableDiv);
    event.dataTransfer.clearData();
    const selectId = `select-${idNumber}`;
    const select = document.getElementById(selectId);
    const taskId = tasks.find(task => task.hva === draggableDiv.innerText).id;
    const userId = select.value;
    const statusId = boxes.find(box => box.name === dropZone.id).code;
    const currentTime = Date.now();
    const link = `https://sar-reg.no/backend/OppdragChange.php?id=${taskId}&status=${statusId}&userId=${userId}&time=${currentTime}`;
    $.getJSON(link);
};

const containerClicked = event => {
    const id = event.target.id;
    if (id.startsWith('draggable') || id.startsWith('name') || id.startsWith('select')) return;
    const selects = document.querySelectorAll('[id^="select-"]');
    for (const select of selects) {
        select.classList.add('hide');
    }
    const names = document.querySelectorAll('[id^="name-"]');
    for (const name of names) {
        name.classList.remove('hide');
    }
};