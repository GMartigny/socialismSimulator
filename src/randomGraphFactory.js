import { Position, Math as M } from "pencil.js";

import { getNodule } from "./Nodule";

/**
 * @class
 */
class WinnableGraph {
    constructor () {
        this.nodes = [];
        this.genus = 1;
        this.leastMoves = 0;
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
export default function randomGraphFactory (constrain, nbNodes, boost) {
    const radius = 50;
    const graph = [];
    let nbLinks = 0;
    for (let i = 0; i < nbNodes; ++i) {
        let position;
        do {
            position = pickPosition(constrain);
        } while (graph.find(node => node.position.distance(position) < radius * 3));

        const newNode = getNodule(position);
        const nbLink = Math.round(M.random(1) + 1);
        newNode.links = graph.map((_, index) => index).filter(index => graph[index].links.length < 3)
            .sort((a, b) => graph[a].position.distance(newNode.position) - graph[b].position.distance(newNode.position))
            .slice(0, nbLink);
        newNode.links.forEach(other => graph[other].links.push(i));
        nbLinks += newNode.links.length;
        graph.push(newNode);
    }

    const span = Math.ceil(nbNodes ** 0.5);
    let total = 0;
    graph.slice(1).forEach((node) => {
        const value = Math.round(M.random(span * 2) - span);
        node.value = value;
        total += value;
    });
    const genus = (nbLinks - nbNodes) + 1;
    const bonus = (nbNodes / 2) * boost;
    graph[0].value = (genus - total) + bonus;
    return graph;
}
