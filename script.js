let tasks;
let names;
const x = () => {
    const timestamp = Date.now();
    $.getJSON("https://sar-reg.no/backend/Oppdrag.php?time=" + timestamp, {}, function (data) {
    tasks = data;
    $.getJSON("https://sar-reg.no/backend/OppdragLag.php?time=" + timestamp, {}, function (data2) {
        names = data2;
        data.forEach(function (d, i) {
            // add div
            var tag = document.createElement("div");
            tag.id = `adraggable-${i+1}`
            tag.classList.add("example-draggable");
            tag.draggable = true;
            tag.addEventListener("dragstart", onDragStart);
            tag.addEventListener("click", clickX);
            var s = document.createElement("span");
            /* s.addEventListener('click', (e) => {
                e.stopPropagation();
            }) */
            s.id = `draggable-${i+1}`
            s.innerHTML = d.hva;
            tag.appendChild(s);
            // add div
            var tag2 = document.createElement("select");
            /* tag2.addEventListener('click', (e) => {
                e.stopPropagation();
            }) */
            tag2.id = `select-${i+1}`;
            tag2.classList.add("hide");
            tag2.addEventListener('change', clickY);
            data2.forEach((d2, j) => {
                var tag3 = document.createElement("option");
                tag3.id = d2.id;
                tag3.value = d2.id;
                tag3.innerHTML = d2.navn;
                if (d2.id === d.lag)
                tag3.setAttribute('selected', true);
                tag2.appendChild(tag3);
            });

            tag.appendChild(tag2);
            let element;
            switch (d.status) {
                case '0':
                    element = document.getElementById("todo");
                    break;
                case '1':
                    element = document.getElementById("assigned");
                    break;
                case '2':
                    element = document.getElementById("progress");
                    break;
                case '3':
                    element = document.getElementById("finished");
                    break;
                case '5':
                    element = document.getElementById("planned");
                    break;
                default:
                    element = document.getElementById("todo");
            }
            element.appendChild(tag);
        });
    });
});
}
x();
setInterval(() => {
    // document.querySelectorAll('.example-draggable').forEach(e => e.remove());
    window.location.reload(1);
}, 10000);

function clickX(event) {

    const y = event.target.id.split('-')[1];
    // const x = document.getElementById(event.target.id)
    document.getElementById(`draggable-${y}`).classList.add('hide');
    document.getElementById(`select-${y}`).classList.remove('hide');
}

function clickY(event) {
    const y = event.target.id.split('-')[1];
    const id = `adraggable-${y}`;
    const draggableElement = document.getElementById(id);
    const id2 = `draggable-${y}`;
    const draggableElement2 = document.getElementById(id2);
    draggableElement2.classList.remove('hide');
    const id3 = `select-${y}`;
    const draggableElement3 = document.getElementById(id3);
    draggableElement3.classList.add('hide');
    if (document.getElementById(id).parentNode.id === 'todo') {
        const dropzone = document.getElementById("assigned");
        dropzone.appendChild(draggableElement);
    }
    const taskId = tasks.find(task => task.hva === draggableElement.innerText).id;
    const userId = draggableElement3.value;
    let statusId;
    switch (document.getElementById(id).parentNode.id) {
        case 'todo':
            statusId = '0'
            break;
        case 'assigned':
            statusId = '1'
            break;
        case 'progress':
            statusId = '2'
            break;
        case 'finished':
            statusId = '3'
            break;
        case 'planned':
            statusId = '5'
            break;
    }
    console.log(taskId, statusId, userId);
    const link = `https://sar-reg.no/backend/OppdragChange.php?id=${taskId}&status=${statusId}&userId=${userId}`
    $.getJSON(link, {}, function (data) {
        console.log(data)
    });
}




function onDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    event.currentTarget.style.backgroundColor = "yellow";
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {

    const id = event.dataTransfer.getData("text");
    const y = id.split('-')[1];
    const draggableElement = document.getElementById(id);
    const dropzone = event.target;
    dropzone.appendChild(draggableElement);
    event.dataTransfer.clearData();
    const id3 = `select-${y}`;
    const x = document.getElementById(id3);
    console.log(x);
    const taskId = tasks.find(task => task.hva === draggableElement.innerText).id;
    const userId = x.value;
    let statusId;
    switch (dropzone.id) {
        case 'todo':
            statusId = '0'
            break;
        case 'assigned':
            statusId = '1'
            break;
        case 'progress':
            statusId = '2'
            break;
        case 'finished':
            statusId = '3'
            break;
        case 'planned':
            statusId = '5'
            break;
    }
    console.log(taskId, statusId, userId);
    const link = `https://sar-reg.no/backend/OppdragChange.php?id=${taskId}&status=${statusId}&userId=${userId}`
    $.getJSON(link, {}, function (data) {
        console.log(data)
    });
}