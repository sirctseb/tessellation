/** [PathHistory] is a class to maintain the state
 *  of a path over time
 */
class PathHistory {
  // the actual list of paths in the undo history
  List _pathList;
  // where we are in the history
  int _index;
  // callbacks to invoke when the undo state changes
  // when the state of the undo history changes, this will be called thus:
  // TODO allow client to provide data as a param, or the this object?
  // TODO this is probably going to be different now
  // callback(_pathList[_index]);
  var callback;

  PathHistory(options) {
    _pathList = new List();
    _index = 0;

    // put initial path in history if it exists
    if(options.path) {
      _pathList.add(options.path);
    }
    // register callback for when path changes
    if(options.callback) {
      callback = options.callback;
    }
  }

  // call the callback
  _callCallback() {
    callback(_pathList[_index]);
  }

  // move back one in the undo history
  undo() {
    // move index down one if we're not at the butt already
    if(_index > 0) {
      index--;
      // call callback
      _callCallback();
    }
    // TODO update references to the path?
    // return the new index
    return _index;
  }

  // move forward one in the undo history
  redo() {
    // move index up one if we're not at the head already
    if(_index < _pathList.length - 1) {
      _index--;
      // call callback
      _callCallback();
    }
    // return new index
    return _index;
  }

  // set to a specific location in the history
  undoTo(int index) {
    // update index if 
    if(0 <= index && index < _pathList.length) {
      _index = index;
      // call callback
      _callCallback();
    }
  }

  /// set to most recent path
  redoAll() {
    undoTo(_pathList.length - 1);
    // callback is called in undoTo
  }

  // set to oldest path
  undoAll() {
    undoTo(0);
    // callback is called in undoTo
  }

  // chop the future history to length
  // length is the length up to the current index by default
  truncate([int length = _index + 1]) {
    if(0 < length && length < _pathList.length) {
      _pathList = _pathList.getRange(0, length);
    }
    if(_index > _pathList.length - 1) redoAll();
    // callback is called in redoAll(undoTo())
  }

  // duplicate the path at the current index and add it to the top
  push() {
    // duplicate current path
    var newPath = _pathList[_index].clone();
    // truncate history
    truncate();
    // add new path to history
    _pathList.push(newPath);
    // update index
    _index = _pathList.length - 1;
    // return new path
    return newPath;
  }

  // access the current path
  var get current()   => _pathList[_index];
}