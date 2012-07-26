/** [Log] is a class for logging
*  based on log level or groups
**/
#library("Log");

class Log {
  // the current logging level
  int level;
  // the set of currently active groups
  Set<String> groups;
  // the name of this log
  String _name;
  String get name => _name;

  // the existing named logs
  static Map<String, Log> logs = {};

  factory Log([int level = 0, Collection<String> groups = null]) {
    return new Log.named("default", level, groups);
  }

  // create named log
  Log._named(this._name, [int level = 0, Collection<String> groups = null]) {
    this.level = level;
    if(groups != null) {
      this.groups = new Set.from(groups);
    } else {
      this.groups = new Set();
    }
    // add to map
    logs[_name] = this;
  }
  factory Log.named(String name) {
    if(logs.containsKey(name)) {
      return logs[name];
    }
    return new Log(name: name);
  }

  bool log(content, [var qualifier]) {
    if(qualifier != null) {
      if(qualifier is num && qualifier <= level) {
        print(content);
        return true;
      }
      if(qualifier is String && groups.contains(qualifier)) {
        print(content);
        return true;
      }
    } else {
        print(content);
        return true;
    }
    return false;
  }
}