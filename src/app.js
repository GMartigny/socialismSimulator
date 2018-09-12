import { Scene, Text, RegularPolygon, Rectangle, Container } from "pencil.js";

import { getNodule } from "./Nodule";
import { store, load } from "./storage";
import { graphFactory, randomGraphFactory } from "./Graph";


const scene = new Scene();

const margin = Math.min(scene.width, scene.height) * 0.1;
const constrain = [(scene.width / 2) - margin, (scene.height / 2) - margin];
const initialNbNode = Math.floor((scene.width * scene.height) / 12e4);
const saved = load();

let graph;
let moves = saved.mv || 0;
let currentLevel = saved.cl || 0;
let difficulty = saved.df || 0;

const wrapper = new Container(scene.center);
scene.add(wrapper);

/**
 * Generate a new game from data or randomly if omitted
 * @param {Array<NoduleData>} [data] -
 */
function generate (data) {
    wrapper.empty();
    graph = data ?
        graphFactory(data, constrain) :
        randomGraphFactory(constrain, Math.floor(initialNbNode + difficulty), 1 - (difficulty % 1));

    for (let i = 0, l = graph.nodes.length; i < l; ++i) {
        const node = graph.get(i);
        wrapper.add(...node.links, node);
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

generate(saved.gr || levels[currentLevel]);

const background = new Rectangle([0, 0], scene.width, scene.height, {
    fill: "#111",
    opacity: 0.5,
    zIndex: 10,
});
const fontSize = 70;
const winText = new Text(scene.center.subtract(0, fontSize), "", {
    fill: "red",
    fontSize,
    align: "center",
    opacity: 1,
    rotationAnchor: [0, fontSize / 2],
});
background.add(winText);

const levelText = new Text([10, 10], `Level: ${currentLevel}`, {
    fill: "#666",
});
scene.add(levelText);

/**
 * Save data
 * @param {Boolean} withoutGraph -
 */
function saveAll (withoutGraph) {
    store({
        cl: currentLevel,
        df: difficulty,
        gr: !withoutGraph && graph,
        mv: !withoutGraph && moves,
    });
}

background.on("click", () => {
    background.remove();
    moves = 0;
    generate(levels[currentLevel]);
    levelText.text = `Level: ${currentLevel}`;
    saveAll();
});
scene.on("lends", () => {
    moves++;
    if (graph.isWon()) {
        scene.add(background);
        winText.text = `You won in ${moves} moves !`;

        // Won a non-tuto level => increase difficulty
        if (!levels[currentLevel]) {
            difficulty += 0.6;
        }
        currentLevel++;

        saveAll(true);
    }
    else {
        saveAll();
    }
}).on("draw", () => {
    if (background.options.shown) {
        winText.options.rotation = Math.cos(winText.frameCount / 20) / 50;
    }
    graph.magnetic();
}, true).startLoop();
