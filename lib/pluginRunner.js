async function RunPlugins (self, type, func, queue, job, args, id, pluginCounter) {
  if (!pluginCounter) { pluginCounter = 0 }
  if (!job) { return true }
  if (job.plugins === null || job.plugins === undefined || job.plugins.length === 0) {
    return true
  }
  if (pluginCounter >= job.plugins.length) {
    return true
  }

  let pluginRefrence = job.plugins[pluginCounter]
  let toRun = await RunPlugin(self, pluginRefrence, type, func, queue, job, args, id)
  pluginCounter++
  if (toRun === false) { return false }

  return RunPlugins(self, type, func, queue, job, args, id, pluginCounter)
}

async function RunPlugin (self, PluginRefrence, type, func, queue, job, args, id) {
  if (!job) { return true }

  let pluginName = PluginRefrence
  if (typeof PluginRefrence === 'function') {
    pluginName = new PluginRefrence(self, func, queue, job, args, id, {}).name
  } else if (typeof pluginName === 'function') {
    pluginName = pluginName.name
  }

  var pluginOptions = null
  if (self.jobs[func].pluginOptions && self.jobs[func].pluginOptions[pluginName]) {
    pluginOptions = self.jobs[func].pluginOptions[pluginName]
  } else {
    pluginOptions = {}
  }

  let plugin = null
  if (typeof PluginRefrence === 'string') {
    let PluginConstructor = require(`./plugins/${PluginRefrence}.js`)[PluginRefrence]
    plugin = new PluginConstructor(self, func, queue, job, args, id, pluginOptions)
  } else if (typeof PluginRefrence === 'function') {
    plugin = new PluginRefrence(self, func, queue, job, args, id, pluginOptions)
  } else {
    throw new Error('Plugin must be the constructor name or an object')
  }

  if (plugin[type] === null || plugin[type] === undefined || typeof plugin[type] !== 'function') {
    return true
  }

  return plugin[type]()
}

exports.RunPlugin = RunPlugin
exports.RunPlugins = RunPlugins
