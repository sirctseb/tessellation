/** [Log] is a class for logging
*  based on log level or groups
**/
#library("Log");

class Log {
  // the current logging level
  int level;
  // the set of currently active groups
  Set<String> groups;

  Log([int level = 0, Collection<String> groups = null]) {
    this.level = level;
    if(groups != null) {
      this.groups = new Set.from(groups);
    } else {
      this.groups = new Set();
    }
  }

  bool Log(content, [int level, String group]) {
    if(level != null) {
      if(level <= this.level) {
        print(content);
        return true;
      }
    } else {
      if(group != null) {
        if(groups.contains(group)) {
          print(content);
          return true;
        }
      } else {
        print(content);
        return true;
      }
    }
    return false;
  }
}