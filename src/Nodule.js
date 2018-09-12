import { Circle, Text, Position, BaseEvent } from "pencil.js";
import Link from "./Link";

const lightBlack = "#333";

/**
 * @class
 */
export class Nodule extends Circle {
    /**
     * Nodule constructor
     * @param {PositionDefinition} position -
     * @param {Number} radius -
     * @param {Number} [value=0] -
     */
    constructor (position, radius, value = 0) {
        super(position, radius, {
            stroke: lightBlack,
        });
        const fontSize = radius / 2;
        const subCircle = new Circle([0, -fontSize + 4], fontSize, {
            fill: "#fff",
            stroke: lightBlack,
            cursor: "pointer",
        });
        this.text = new Text([0, -(fontSize / 2)], "0", {
            align: Text.alignments.center,
            fill: lightBlack,
            fontSize,
            cursor: "pointer",
        });
        subCircle.add(this.text);
        this.add(subCircle);
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
        this.links.forEach(link => link.sendFrom(this));
        this.fire(new BaseEvent(this, "lends"));
    }

    /**
     * @override
     */
    remove () {
        this.links.forEach(link => link.remove());
        super.remove();
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
        this._value = Math.round(value);
        this.text.text = this._value.toString();
        if (this._value < 0) {
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
        if (nodule && !this.links.find(link => link.getOther(this) === nodule)) {
            const newLink = new Link(this, nodule);
            this.links.push(newLink);
            nodule.links.push(newLink);
            return newLink;
        }
        return null;
    }

    /**
     * @override
     */
    toJSON () {
        return {
            position: this.position.toJSON(),
            links: [],
            value: this.value,
        };
    }
}

/**
 * @typedef {Object} NoduleData
 * @param {Position} pos -
 * @param {Array<Number>} links -
 * @param {Number} value -
 */
/**
 * Return a json formatted nodule
 * @param {Position} position -
 * @param {Array<Number>} links -
 * @param {Number} value -
 * @return {NoduleData}
 */
export function getNodule (position, links = [], value = 0) {
    return {
        position: Position.from(position),
        links,
        value,
    };
}
