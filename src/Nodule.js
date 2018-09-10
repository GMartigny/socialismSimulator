import { Circle, Text } from "pencil.js";
import Link from "./Link";

/**
 * @class
 */
export default class Nodule extends Circle {
    /**
     * Nodule constructor
     * @param {PositionDefinition} position -
     * @param {Number} [value=0] -
     */
    constructor (position, value = 0) {
        super(position, 50, {
            stroke: "#333",
            fill: "#aaa",
        });
        this.text = new Text([0, -25], "", {
            align: Text.alignments.center,
            fill: "#fff",
            fontSize: 50,
            cursor: "pointer",
        });
        this.add(this.text);
        this.links = [];
        this._value = null;
        this.value = value;

        this.on("click", () => this.click());
        this.draggable();
    }

    /**
     * Click action
     */
    click () {
        this.value -= this.links.length;
        this.links.forEach(link => link.value += 1);
    }

    /**
     * @return {Number}
     */
    get value () {
        return this._value;
    }

    /**
     * @param {Number} value -
     */
    set value (value) {
        this._value = value;
        this.text.text = value.toString();
        if (value < 0) {
            this.options.fill = "#ff7365";
        }
        else {
            this.options.fill = "#99ff66";
        }
    }

    /**
     * @param {Nodule} nodule - Another nodule
     * @return {Link}
     */
    linkTo (nodule) {
        if (nodule && !this.links.includes(nodule)) {
            this.links.push(nodule);
            nodule.links.push(this);
            return new Link(this, nodule);
        }
        return null;
    }
}
