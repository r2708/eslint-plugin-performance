'use strict';

/**
 * Array iteration methods that act as implicit loops.
 * Shared across all loop-tracking rules.
 */
const ARRAY_METHODS = ['forEach', 'map', 'filter', 'reduce', 'some', 'every', 'find'];

/**
 * AST node types that represent traditional loop statements.
 */
const LOOP_NODES = [
  'ForStatement',
  'ForOfStatement',
  'ForInStatement',
  'WhileStatement',
  'DoWhileStatement',
];

/**
 * Populate a listeners object with loop enter/exit handlers for all loop node types.
 * @param {Object} listeners - The rule listeners object to add to.
 * @param {Function} onEnter - Called when entering a loop node.
 * @param {Function} onExit - Called when exiting a loop node.
 */
function addLoopListeners(listeners, onEnter, onExit) {
  for (const loop of LOOP_NODES) {
    listeners[loop] = onEnter;
    listeners[`${loop}:exit`] = onExit;
  }
}

module.exports = { ARRAY_METHODS, addLoopListeners };
