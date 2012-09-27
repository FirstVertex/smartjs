({
    baseUrl: "../../client/app",
    out: "debug/main.min.js",
    name: "main",
    // don't allow a real phonegap on web builds
    stubModules: ['phonegap'],
    // important for finding dynamically added scripts
    findNestedDependencies: true,
    // for debugging we turn off optimization so we can still read it when there's a problem
    optimize: 'none',
    mainConfigFile: '../../client/app/main.js'
})