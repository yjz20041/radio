# radio

  overview: a tiny messenger framework
  support component: Regular
  api:
  1.subcribe(component, name[, callback, relativePath]): subcribe messages
  example:
   messenger.subcribe(this, 'hello', function () {}, '..')
  
  2.unsubcibe(component[, name, callback, relativePath]): unsubcribe messages
  example:
   messenger.unsubcribe(this)
  
  3.dispatch(component, name[, data, relativePath]): dispatch a specified message
  example:
   messenger.dispatch(this, 'hello', 'nice to meet you')
  
  4.checkin(component): check in the component into the messenger
  example:
   messenger.checkin(rootComponent)
  
  5.checkout(component): check out the component from the messenger
  example:
   messenger.checkout(rootComponent)
  
  popo: hzyangjiezheng
  version: 0.0.1
  update: 20170815
