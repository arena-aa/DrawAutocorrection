import { Point, targetImageHeight, targetImageWidth, Dimensions, Shape, ShapeTypes } from './geometry.js';

const canvas = document.getElementById("canvas")
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const hidden_cnv = document.createElement("canvas")

const ctx = canvas.getContext("2d")
const hidden_ctx = hidden_cnv.getContext('2d');
hidden_cnv.height = targetImageHeight;
hidden_cnv.width = targetImageWidth;

const config = {
    'lineSize': 8,
}
// previous mouse positions
// They will be null initially
let prevX = null
let prevY = null

let allShapes = []
let currentShapePoints = []

let draw = false

// How thick the lines should be
ctx.lineWidth = config.lineSize
ctx.lineJoin = 'round'
ctx.lineCap = 'round'
hidden_ctx.lineWidth = config.lineSize
hidden_ctx.lineJoin = 'round'
hidden_ctx.lineCap = 'round'

async function postData(url = '', data, id) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            image: data
        })
    });
    return response.json();
}



// Selecting all the div that has a class of clr

function eraseCanvas(canvas) {
    let ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, 5000, 5000);
}

let clrs = document.querySelectorAll(".clr")
// Converting NodeList to Array
clrs = Array.from(clrs)
clrs.forEach(clr => {
    clr.addEventListener("click", () => {
        ctx.strokeStyle = clr.dataset.clr
    })
})

let clearBtn = document.querySelector(".clear")
clearBtn.addEventListener("click", () => {
    eraseCanvas(canvas);
})

// Saving drawing as image
let saveBtn = document.querySelector(".save")
saveBtn.addEventListener("click", () => {
//    let dim = findDimIn(points);
//    getScaledImageFrom(dim);
    saveImage("sketch.png");
})

function saveImage(name) {
    let data = hidden_cnv.toDataURL("imag/png")
    let a = document.createElement("a")
    a.href = data
    a.download = name
    a.click()
}

// Set draw to true when mouse is pressed
window.addEventListener("mousedown", (e) => {
    draw = true;
})
// Set draw to false when mouse is released
window.addEventListener("mouseup", async (e) => {
    draw = false;
    const rect = findDimIn(currentShapePoints);
    console.log(rect);
    const shape = new Shape(rect, currentShapePoints);
    allShapes.push(shape)
    currentShapePoints = [];
    let data = getScaledImageFrom(shape);
    let response = await postData('http://localhost:5000/api/uploadImage', data, shape.id);
    console.log(response)
    adjustShapeTo(response.type, response.id)
})

window.addEventListener("mousemove", (e) => {
    // initially previous mouse positions are null
    // so we can't draw a line
    if(prevX == null || prevY == null || !draw) {
        // Set the previous mouse positions to the current mouse positions
        prevX = e.clientX
        prevY = e.clientY
        return
    }
    // Current mouse position
    let currentX = e.clientX
    let currentY = e.clientY
    // Drawing a line from the previous mouse position to the current mouse position
    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()
    // Update previous mouse position
    prevX = currentX
    prevY = currentY
    let point = new Point(e.clientX, e.clientY)
    currentShapePoints.push(point)
})

function adjustShapeTo(shapeType, shapeId) {
    if(shapeType === ShapeTypes.OTHER) {
        return;
    }
    const shape = allShapes.findLast(item => item.id === shapeId);
    eraseCanvas(canvas);

//    const shapesToRedraw = allShapes.filter(item => {
//        if(item.id == shapeId) {
//            return false;
//        }
//
//        return item.rect.isIntersectsFrame(shape.rect);
//    });

//    if (shapesToRedraw.length > 0) {
//        shapesToRedraw.forEach(item => drawShape(item));
//    }

    switch(shapeType) {
    case ShapeTypes.ARROW:
        let [start, end] = shape.farPoints2();
        drawArrow(start.x, start.y, end.x, end.y);
        break;
    case ShapeTypes.CIRCLE:
        const center = shape.rect.center;
        const radius = shape.rect.width / 2;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.stroke()
        break;
    case ShapeTypes.LINE:
        const startPoint = shape.points[0];
        const endPoint = shape.points[shape.points.length - 1];
        drawLine(startPoint, endPoint);
        break;
    case ShapeTypes.RECTANGLE:
        drawRectangle(shape.rect);
        break;
    case ShapeTypes.TRIANGLE:
        let [startP, middleP, endP] = shape.farPoints3();
        drawTriangle(startP, middleP, endP);
        break;
    }
}

//function eraseRect(rect) {
//    console.log(rect);
//    ctx.clearRect(rect.minX, rect.minY, rect.width, rect.height)
//}

function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.stroke()
}

function drawRectangle({ minX, minY, width, height }) {
    ctx.beginPath()
    ctx.rect(minX, minY, width, height);
    ctx.stroke()
}

function drawArrow(fromx, fromy, tox, toy) {
    let headlen = 95; // length of head in pixels
    let dx = tox - fromx;
    let dy = toy - fromy;
    let angle = Math.atan2(dy, dx);
    //ctx.clearRect(0, 0, targetImageWidth, targetImageHeight);
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawTriangle(startPoint, middlePoint, lastPoint) {
    console.log(startPoint, middlePoint, lastPoint);
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(middlePoint.x, middlePoint.y);
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(startPoint.x, startPoint.y);
    ctx.stroke()
}

//function drawShape(shape) {
//    ctx.beginPath();
//    ctx.moveTo(shape.points[0].x, shape.points[0].y);
//    shape.points.forEach(point => {
//        ctx.lineTo(point.x, point.y);
//    });
//    ctx.stroke();
//}

function findDimIn(points) {
    let cMaxX = -9999;
    let cMinX = 9999;
    let cMaxY = -9999;
    let cMinY = 9999;

    points.forEach(point => {
        if (point.x >= cMaxX) {
            cMaxX = point.x;
        }
        if (point.x <= cMinX) {
            cMinX = point.x;
        }
        if (point.y >= cMaxY) {
            cMaxY = point.y;
        }
        if (point.y <= cMinY) {
            cMinY = point.y;
        }
    });
    return new Dimensions(cMinX, cMinY, cMaxX, cMaxY);
}

function getScaledImageFrom(shape) {
    const scaleX = targetImageWidth / canvas.width
    const scaleY = targetImageHeight / canvas.height

    const scaledX = shape.rect.minX * scaleX;
    const scaledY = shape.rect.minY * scaleY;

    const resultX = scaledX;
    const resultY = scaledY;

    hidden_ctx.scale(scaleX, scaleY);

    let myColors  =["blue","red","green","yellow","black"];
    let colorPicker = Math.ceil(5* Math.random() -1);
    hidden_ctx.strokeStyle = myColors[colorPicker];
    hidden_ctx.beginPath()
    hidden_ctx.moveTo(shape.points[0].x, shape.points[0].y)
    shape.points.forEach(point => {
        hidden_ctx.lineTo(point.x, point.y);
    })
    hidden_ctx.stroke()
    const data = hidden_cnv.toDataURL("image/png");
    hidden_ctx.clearRect(0,0,1000,1000)
    return data
}