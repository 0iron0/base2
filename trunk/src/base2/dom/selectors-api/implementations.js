
// Apply the NodeSelector interface

Document.implement(NodeSelector);
Element.implement(NodeSelector);

// Allow the Selector engine to be extended.

Selector.pseudoClasses = _pseudoClasses;
Selector.operators = _operators;
