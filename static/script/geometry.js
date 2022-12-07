function UUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    distanceTo(point) {
        const a = Math.abs(this.x - point.x);
        const b = Math.abs(this.y - point.y);
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }
}

export class Dimensions {
    constructor(minX, minY, maxX, maxY) {
        this.minX = minX-10;
        this.minY = minY-10;
        this.maxX = maxX+10;
        this.maxY = maxY+10;
        this.height = this.maxY - this.minY;
        this.width = this.maxX - this.minX;
        this.center = new Point(
            this.width / 2 + this.minX,
            this.height / 2 + this.minY
        );
    }

    isIntersectsFrame(frame) {
        return !(this.minY < frame.maxY || this.maxY > frame.minY || this.minX < frame.maxX || this.maxX > frame.minX)
    }
}

class IndexPoint {
    constructor(index, value) {
        this.index = index;
        this.value = value;
    }
}

export class Shape {
    constructor(rect, points) {
        this.id = UUID();
        this.rect = rect;
        this.points = points;
    }

    farPoints2() {
        const centerIndex = Math.round(this.points.length / 2);
        let farPointIndex1 = 0;
        console.log(this.points)
        console.log(centerIndex)
        console.log(this.points[centerIndex])
        let farPointDistance1 = this.points[farPointIndex1].distanceTo(this.points[centerIndex]);
        let farPointIndex2 = centerIndex + 1;
        let farPointDistance2 = this.points[farPointIndex2].distanceTo(this.points[centerIndex]);

        for(let i = 1; i < centerIndex; i++) {
            const distance = this.points[i].distanceTo(this.points[centerIndex]);
            if(distance > farPointDistance1) {
                farPointIndex1 = i;
                farPointDistance1 = distance;
            }
        }

        for(let i = centerIndex + 1; i < this.points.length - 1; i++) {
            const distance = this.points[i].distanceTo(this.points[centerIndex]);
            if(distance > farPointDistance1) {
                farPointIndex2 = i;
                farPointDistance2 = distance;
            }
        }

        return [this.points[farPointIndex1], this.points[farPointIndex2]];
    }

    farPoints3() {
        let length = this.points.length;
        let result = [];

        for(let i = 0; i < length - 1; i++) {
            let currentPoint = this.points[i];
            let maxPointIndex = 1
            let maxPointDist = currentPoint.distanceTo(this.points[1])
            for(let j = 1; j < length - 1; j++) {
                let currentDistance = currentPoint.distanceTo(this.points[j]);
                if (maxPointDist < currentDistance) {
                    maxPointDist = currentDistance;
                    maxPointIndex = j;
                }
            }
            result.push(new IndexPoint(maxPointIndex, maxPointDist));
        }

        result.sort((lhs, rhs) => lhs.value > rhs.value);
        let [start, middle, end] = new Set(result.map(item => item.index));
        return [this.points[start], this.points[middle], this.points[end]];
    }
}

export const ShapeTypes = {
    ARROW: 0,
    CIRCLE: 1,
    LINE: 2,
    OTHER: 3,
    RECTANGLE: 4,
    TRIANGLE: 5
};

export const targetImageWidth = 745;
export const targetImageHeight = 395;