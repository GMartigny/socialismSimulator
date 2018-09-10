import { Scene, Text, RegularPolygon, Math as M } from "pencil.js";

import Nodule from "./Nodule";

/**
 * Return a rounded random number
 * @param {Number} max - Max value of the random
 * @return {Number}
 */
function random (max) {
    return Math.round(M.random(max));
}

const scene = new Scene();

const margin = Math.min(scene.width, scene.height) * 0.1;
const constrain = [[margin, margin], [scene.width - margin, scene.height - margin]];
const nbNodes = Math.floor((scene.width * scene.height) / 12e4);

let nodes;
let won;
let moves;
let currentLevel = 0;
let difficulty = 0;

/**
 * @typedef {Object} NoduleData
 * @param {Position} pos -
 * @param {Array<Number>} links -
 * @param {Number} value -
 */
/**
 * Return a json formatted nodule
 * @param {Position} pos -
 * @param {Array<Number>} links -
 * @param {Number} value -
 * @return {NoduleData}
 */
function getNodule (pos, links = [], value = 0) {
    return {
        pos,
        links,
        value,
    };
}

/**
 * Return a random playable graph
 * @return {Array<NoduleData>}
 */
function getRandomGraph () {
    const graph = [];
    let nbLinks = 0;
    for (let i = 0; i < nbNodes; ++i) {
        const newNode = getNodule(scene.getRandomPosition().constrain(...constrain));
        const nbLink = random(2) + 1;
        newNode.links = graph.filter(node => node.links.length < 4)
            .sort((a, b) => a.pos.distance(newNode.position) - b.pos.distance(newNode.position))
            .slice(0, nbLink).map((_, index) => index);
        nbLinks += newNode.links.length;
        graph.push(newNode);
    }

    const span = Math.ceil(nbNodes ** 0.5);
    let total = 0;
    graph.slice(1).forEach((node) => {
        const value = random(span * 2) - span;
        node.value = value;
        total += value;
    });
    graph[0].value = ((nbLinks - nbNodes) + 1) - total;
    return graph;
}

/**
 * Generate a new game from data or randomly if omitted
 * @param {Array<NoduleData>} [data] -
 */
function generate (data) {
    const graph = data || getRandomGraph(nbNodes);
    won = false;
    moves = 0;
    scene.empty();
    nodes = [];

    for (let i = 0, l = graph.length; i < l; ++i) {
        const nodeData = graph[i];
        const newNode = new Nodule(nodeData.pos, nodeData.value);
        const newLinks = nodeData.links.filter(linked => linked < i).map(linked => newNode.linkTo(nodes[linked]));
        scene.add(...newLinks, newNode);
        nodes.push(newNode);
    }
}

const levels = [
    [
        getNodule(scene.center.subtract(100, 0), [1], 1),
        getNodule(scene.center.add(100, 0), [0], -1),
    ],
    [
        getNodule(scene.center.subtract(300, 0), [1], 2),
        getNodule(scene.center, [0, 2], -4),
        getNodule(scene.center.add(300, 0), [1], 2),
    ],
    (() => {
        const positions = RegularPolygon.getRotatingPoints(3, 200).map(pos => pos.add(scene.center));
        return [
            getNodule(positions[0], [1, 2], 3),
            getNodule(positions[1], [0, 2], -2),
            getNodule(positions[2], [0, 1], 1),
        ];
    })(),
    (() => {
        let i = 0;
        const positions = RegularPolygon.getRotatingPoints(8, 200).map(pos => pos.add(scene.center));
        return [
            getNodule(positions[i++], [], 5),
            getNodule(positions[i++], [i - 2], 1),
            getNodule(positions[i++], [i - 2], 1),
            getNodule(positions[i++], [i - 2], 1),
            getNodule(positions[i++], [i - 2], -2),
            getNodule(positions[i++], [i - 2], 1),
            getNodule(positions[i++], [i - 2], 1),
            getNodule(positions[i++], [i - 2, 0], 1),
        ];
    })(),
];

generate(levels[currentLevel]);
scene.on("click", () => {
    if (won) {
        generate(levels[++currentLevel]);
    }
    else {
        moves++;
        if (!nodes.find(node => node.value < 0)) {
            won = new Text(scene.center.subtract(0, 70), `You won in ${moves} moves !`, {
                fill: "red",
                fontSize: 70,
                align: "center",
            });
            scene.add(won);
        }
    }
}).on("draw", () => {
    if (won) {
        won.options.rotation = Math.cos(won.frameCount / 20) / 50;
    }
}, true).startLoop();
