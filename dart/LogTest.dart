#import("Log.dart");

  void main() {
  Log log = new Log();
  
  log.log("def");
  log.log("with level invisible", 1);
  log.level = 2;
  log.log("with level visible", 1);
  log.log("with group invisible", "group");
  log.groups.add("group");
  log.log("with group visible", "group");
  log.log("can we do this?", "group");
}