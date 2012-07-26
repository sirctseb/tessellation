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