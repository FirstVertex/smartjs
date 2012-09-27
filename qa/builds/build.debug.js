// this build doesn't really line up with an environment/config
// it is to output the default (web) config in one file but with no minification
// it is used for debugging the build process itself
({
    baseUrl: "../../client/app",
    out: "debug/main.js",
    name: "main",
    // important for finding dynamically added scripts
    findNestedDependencies: true,
    // for debugging we turn off optimization so we can still read the built output
    // since uglify isn't called we don't get to --define so the default build must do
    // if in this situation you need to debug non default configs then just set it in /client/app/config.js temporarily
    optimize: 'none',
    mainConfigFile: '../../client/app/main.js'
})