import { Scene, Text, RegularPolygon } from "pencil.js";

import { Nodule, getNodule } from "./Nodule";
import { store, load } from "./storage";
import randomGraphFactory from "./randomGraphFactory";


const scene = new Scene();

const margin = Math.min(scene.width, scene.height) * 0.1;
const constrain = [(scene.width / 2) - margin, (scene.height / 2) - margin];
const initialNbNode = Math.floor((scene.width * scene.height) / 12e4);
const saved = load();

let nodes;
let won;
let moves;
let currentLevel = saved.cl || 0;
let difficulty = saved.df || 0;

/**
 * Generate a new game from data or randomly if omitted
 * @param {Array<NoduleData>} [data] -
 */
function generate (data) {
    const graph = data || randomGraphFactory(constrain, Math.floor(initialNbNode + difficulty), 1 - (difficulty % 1));
    moves = 0;
    scene.empty();
    nodes = [];

    for (let i = 0, l = graph.length; i < l; ++i) {
        const nodeData = graph[i];
        const newNode = new Nodule(nodeData.position.add(scene.center), nodeData.value);
        const newLinks = nodeData.links.filter(linked => linked < i).map(linked => newNode.linkTo(nodes[linked]));
        scene.add(...newLinks, newNode);
        nodes.push(newNode);
    }
}

const levels = [
    [
        getNodule([-100, 0], [1], 1),
        getNodule([100, 0], [0], -1),
    ],
    [
        getNodule([-300, 0], [1], 2),
        getNodule([0, 0], [0, 2], -4),
        getNodule([300, 0], [1], 2),
    ],
    (() => {
        let i = 0;
        const positions = RegularPolygon.getRotatingPoints(3, 200);
        return [
            getNodule(positions[i++], [1, 2], 3),
            getNodule(positions[i++], [0, 2], -2),
            getNodule(positions[i], [0, 1], 1),
        ];
    })(),
    (() => {
        let i = 0;
        const positions = RegularPolygon.getRotatingPoints(8, 200);
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
        won = false;
        generate(levels[currentLevel]);
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

            // Won a non-tuto level => increase difficulty
            if (!levels[currentLevel]) {
                difficulty += 0.6;
            }
            currentLevel++;

            store({
                cl: currentLevel,
                df: difficulty,
            });
        }
    }
}).on("draw", () => {
    if (won) {
        won.options.rotation = Math.cos(won.frameCount / 20) / 50;
    }
}, true).startLoop();
