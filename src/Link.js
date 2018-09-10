import { Spline } from "pencil.js";

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
            zIndex: -1,
        });
        this.to = to.position;
        this.middle = this.position.clone().lerp(this.to, 0.5);
    }

    /**
     * @override
     */
    trace (...params) {
        const center = this.position.clone().lerp(this.to, 0.5);
        this.middle.lerp(center, 0.05);
        this.points = [this.middle, this.to].map(point => point.clone().subtract(this.position));
        super.trace(...params);
    }
}
