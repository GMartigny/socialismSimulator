import { Position, Math as M } from "pencil.js";

import { Nodule } from "./Nodule";

/**
 * @class
 */
class WinnableGraph {
    /**
     * WinnableGraph constructor
     */
    constructor () {
        this.nodes = [];
    }

    /**
     * Check if graph is balanced
     * @return {Boolean}
     */
    isWon () {
        return !this.nodes.find(node => node.value < 0);
    }

    /**
     * Return the nodule at a given index
     * @param {Number} index - Index of the nodule
     * @returns {Nodule}
     */
    get (index) {
        return this.nodes[index];
    }

    /**
     * Add a new nodule to this graph
     * @param {Nodule} nodule - New nodule to add
     * @returns {WinnableGraph} Itself
     */
    add (nodule) {
        this.nodes.push(nodule);
        return this;
    }

    /**
     * Apply a repulsion force to every nodules
     */
    magnetic () {
        const optimal = this.nodes[0].radius * 3;
        this.nodes.forEach((node) => {
            if (!node.isDragged) {
                const forces = this.nodes.reduce((acc, other) => {
                    const distance = node.position.distance(other.position);
                    if (other !== node && distance < optimal) {
                        acc.add(node.position.clone().subtract(other.position).multiply((optimal - distance) ** 2));
                    }
                    return acc;
                }, new Position(0, 0));
                node.position.add(forces.divide(3e5));
            }
        });
    }

    /**
     * Return a JSON ready object
     * @return {Array}
     */
    toJSON () {
        const json = this.nodes.map(node => node.toJSON());
        json.forEach((node, index) => {
            node.links = node.links.map(link => this.nodes.indexOf(link.getOther(this.get(index))));
        });
        return json;
    }

    /**
     * Returns optimal nodule radius of this graph
     * @param {Number} nbNodes - Number of nodes in this graph
     * @param {Array<Number>} constrain - Max width and height of the scene
     * @returns {Number}
     */
    static getNoduleRadius (nbNodes, constrain) {
        const space = Math.min(...constrain);
        return space / ((nbNodes ** 0.5) * 2);
    }
}

/**
 *
 * @param {Array} constrain -
 * @return {Position}
 */
function pickPosition (constrain) {
    return new Position(M.random(-constrain[0], constrain[0]), M.random(-constrain[1], constrain[1]));
}

/**
 * Return a random winnable graph
 * @param {Array<Number>} constrain -
 * @param {Number} nbNodes -
 * @param {Number} boost -
 * @return {WinnableGraph}
 */
export function randomGraphFactory (constrain, nbNodes, boost) {
    const radius = WinnableGraph.getNoduleRadius(nbNodes, constrain);
    const graph = new WinnableGraph();
    let nbLinks = 0;
    for (let i = 0; i < nbNodes; ++i) {
        let position;
        const check = () => graph.nodes.find(node => node.position.distance(position) < radius * 2);
        do {
            position = pickPosition(constrain);
        } while (check());

        const newNode = new Nodule(position, radius);
        graph.nodes.map((_, index) => index).filter(index => graph.get(index).links.length < 3)
            .sort((a, b) => graph.get(a).position.distance(position) - graph.get(b).position.distance(position))
            .slice(0, Math.round(M.random(1) + 1))
            .forEach(link => newNode.linkTo(graph.get(link)));
        nbLinks += newNode.links.length;
        graph.add(newNode);
    }

    const span = Math.ceil(nbNodes ** 0.5);
    let total = 0;
    graph.nodes.slice(1).forEach((node) => {
        const value = Math.round(M.random(span * 2) - span);
        node.value = value;
        total += value;
    });
    const genus = (nbLinks - nbNodes) + 1;
    const bonus = (nbNodes / 2) * boost;
    graph.get(0).value = (genus - total) + bonus;
    return graph;
}

/**
 * Build a graph from data
 * @param {Array} data -
 * @param {Array} constrain -
 * @return {WinnableGraph}
 */
export function graphFactory (data, constrain) {
    const radius = WinnableGraph.getNoduleRadius(data.length, constrain);
    const graph = new WinnableGraph();

    for (let i = 0, l = data.length; i < l; ++i) {
        const nodeData = data[i];
        const newNode = new Nodule(nodeData.position, radius, nodeData.value);
        nodeData.links.filter(linked => linked < i).map(linked => newNode.linkTo(graph.nodes[linked]));
        graph.add(newNode);
    }
    return graph;
}
