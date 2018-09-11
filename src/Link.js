import { Spline, Circle } from "pencil.js";

/**
 * @class
 */
export default class Link extends Spline {
    /**
     * Link constructor
     * @param {Nodule} from -
     * @param {Nodule} to -
     */
    constructor (from, to) {
        super(from.position, [], 0.2, {
            stroke: "#333",
            zIndex: -10,
        });
        this.from = from;
        this.to = to;
        this.middle = this.position.clone().lerp(this.to.position, 0.5);
    }

    /**
     * @override
     */
    trace (...params) {
        const center = this.position.clone().lerp(this.to.position, 0.5);
        this.middle.lerp(center, 0.05);
        this.points = [this.middle, this.to.position].map(point => point.clone().subtract(this.position));

        this.children.forEach((child) => {
            child.position.lerp(child.options.destination, 0.08);
            if (child.position.distance(child.options.destination) < child.radius) {
                child.remove();
            }
        });

        super.trace(...params);
    }

    /**
     * Return the other nodule of a link
     * @param {Nodule} nodule -
     * @return {Nodule}
     */
    getOther (nodule) {
        if (nodule === this.from) {
            return this.to;
        }
        else if (nodule === this.to) {
            return this.from;
        }
        return null;
    }

    /**
     *
     * @param {Position} origin -
     */
    sendFrom (origin) {
        const destination = this.getOther(origin);
        destination.value += 1;
        const message = new Circle(origin.position.clone().subtract(this.position), 10, {
            fill: "#99ff66",
            stroke: "#333",
            zIndex: -5,
            destination: destination.position.clone().subtract(this.position),
        });
        this.add(message);
    }
}
